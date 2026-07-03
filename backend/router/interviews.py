from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload
from typing import List, Optional
from database import get_db
import models, schemas
from services.auth import get_current_user_optional, assert_can_access_interview

router = APIRouter()

@router.get("/questions", response_model=List[schemas.QuestionResponse])
def get_questions(role: str = None, keywords: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Question)
    if role:
        query = query.filter(models.Question.role == role)
    questions = query.all()
    
    if keywords and questions:
        keyword_list = [k.strip().lower() for k in keywords.split(",") if k.strip()]
        keyword_set = set(keyword_list)
        scored_questions = []
        for q in questions:
            score = 0
            if q.suggested_keywords:
                suggested_list = [sk.strip().lower() for sk in q.suggested_keywords.split(",") if sk.strip()]
                for sk in suggested_list:
                    if sk in keyword_set or any(kw in sk or sk in kw for kw in keyword_set):
                        score += 1
            scored_questions.append((score, q))
        scored_questions.sort(key=lambda x: x[0], reverse=True)
        return [q for score, q in scored_questions]
        
    return questions

@router.post("/interviews", response_model=schemas.InterviewResponse)
def create_interview(
    interview: schemas.InterviewCreate, 
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    # Ownership is derived from the verified token only; a client-supplied
    # user_id is never trusted. Anonymous sessions get user_id = None.
    user_id = current_user.id if current_user else None
    db_interview = models.Interview(role=interview.role, user_id=user_id)
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    return db_interview

@router.get("/interviews/{interview_id}", response_model=schemas.InterviewResponse)
def get_interview(
    interview_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    db_interview = db.query(models.Interview).options(
        selectinload(models.Interview.responses).selectinload(models.Response.metrics)
    ).filter(models.Interview.id == interview_id).first()
    if not db_interview:
        raise HTTPException(status_code=404, detail="Interview session not found")
    assert_can_access_interview(db_interview, current_user)
    return db_interview

@router.post("/interviews/{interview_id}/complete", response_model=schemas.InterviewResponse)
def complete_interview(
    interview_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    db_interview = db.query(models.Interview).filter(models.Interview.id == interview_id).first()
    if not db_interview:
        raise HTTPException(status_code=404, detail="Interview session not found")
    assert_can_access_interview(db_interview, current_user)
    db_interview.status = "Completed"
    db.commit()
    db.refresh(db_interview)
    return db_interview

@router.get("/dashboard-stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    # Scope to the authenticated user, or to anonymous sandbox interviews
    # (user_id IS NULL) when there is no verified user.
    owner_filter = (
        models.Interview.user_id == current_user.id
        if current_user
        else models.Interview.user_id.is_(None)
    )

    # 1. Total interviews completed
    total_interviews = db.query(func.count(models.Interview.id)).filter(
        models.Interview.status == "Completed", owner_filter
    ).scalar() or 0

    # 2. Average metric scores across all completed interviews, computed in SQL
    # (avoids loading every Metric row into memory just to average four columns).
    avg_row = (
        db.query(
            func.avg(models.Metric.clarity_score),
            func.avg(models.Metric.relevance_score),
            func.avg(models.Metric.grammar_score),
            func.avg(models.Metric.words_per_minute),
        )
        .join(models.Response, models.Metric.response_id == models.Response.id)
        .join(models.Interview, models.Response.interview_id == models.Interview.id)
        .filter(models.Interview.status == "Completed", owner_filter)
        .one()
    )
    avg_clarity = avg_row[0] or 0.0
    avg_relevance = avg_row[1] or 0.0
    avg_grammar = avg_row[2] or 0.0
    avg_wpm = avg_row[3] or 0.0

    # 3. Filler-words trend for the last 5 completed interviews. Sum filler
    # counts per interview in SQL instead of eager-loading responses + metrics
    # (which pulls heavy transcript/feedback TEXT only to add one integer).
    trend_rows = (
        db.query(
            models.Interview.created_at,
            func.coalesce(func.sum(models.Metric.filler_words_count), 0),
        )
        .outerjoin(models.Response, models.Response.interview_id == models.Interview.id)
        .outerjoin(models.Metric, models.Metric.response_id == models.Response.id)
        .filter(models.Interview.status == "Completed", owner_filter)
        .group_by(models.Interview.id)
        .order_by(models.Interview.created_at.desc())
        .limit(5)
        .all()
    )
    # Reverse to chronological order to match the historical (#1..#N) labeling.
    trend_rows = list(reversed(trend_rows))

    filler_words_trend = []
    for index, (created_at, total_fillers) in enumerate(trend_rows):
        date_str = created_at.strftime("%b %d")
        filler_words_trend.append({
            "date": f"{date_str} (#{index + 1})",
            "count": str(int(total_fillers)),
        })

    # fallback trend if empty
    if not filler_words_trend:
        filler_words_trend = [{"date": "No Data", "count": "0"}]
        
    return {
        "total_interviews": total_interviews,
        "average_clarity": round(avg_clarity, 1),
        "average_relevance": round(avg_relevance, 1),
        "average_grammar": round(avg_grammar, 1),
        "filler_words_trend": filler_words_trend,
        "average_wpm": round(avg_wpm, 1)
    }

@router.get("/interviews", response_model=List[schemas.InterviewResponse])
def get_user_interviews(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    owner_filter = (
        models.Interview.user_id == current_user.id
        if current_user
        else models.Interview.user_id.is_(None)
    )
    query = db.query(models.Interview).options(
        selectinload(models.Interview.responses).selectinload(models.Response.metrics)
    ).filter(owner_filter)
    return query.order_by(models.Interview.created_at.desc()).all()
