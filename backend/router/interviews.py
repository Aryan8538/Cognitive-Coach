from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas

router = APIRouter()

@router.get("/questions", response_model=List[schemas.QuestionResponse])
def get_questions(role: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Question)
    if role:
        query = query.filter(models.Question.role == role)
    return query.all()

@router.post("/interviews", response_model=schemas.InterviewResponse)
def create_interview(interview: schemas.InterviewCreate, db: Session = Depends(get_db)):
    db_interview = models.Interview(role=interview.role, user_id=interview.user_id)
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    return db_interview

@router.get("/interviews/{interview_id}", response_model=schemas.InterviewResponse)
def get_interview(interview_id: str, db: Session = Depends(get_db)):
    db_interview = db.query(models.Interview).filter(models.Interview.id == interview_id).first()
    if not db_interview:
        raise HTTPException(status_code=404, detail="Interview session not found")
    return db_interview

@router.post("/interviews/{interview_id}/complete", response_model=schemas.InterviewResponse)
def complete_interview(interview_id: str, db: Session = Depends(get_db)):
    db_interview = db.query(models.Interview).filter(models.Interview.id == interview_id).first()
    if not db_interview:
        raise HTTPException(status_code=404, detail="Interview session not found")
    db_interview.status = "Completed"
    db.commit()
    db.refresh(db_interview)
    return db_interview

@router.get("/dashboard-stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    # 1. Total interviews completed
    total_interviews = db.query(models.Interview).filter(models.Interview.status == "Completed").count()
    
    # Calculate average metric scores across all completed interviews
    metrics_query = db.query(models.Metric).join(models.Response).join(models.Interview).filter(models.Interview.status == "Completed").all()
    
    avg_clarity = 0.0
    avg_relevance = 0.0
    avg_grammar = 0.0
    avg_wpm = 0.0
    
    if metrics_query:
        avg_clarity = sum(m.clarity_score for m in metrics_query) / len(metrics_query)
        avg_relevance = sum(m.relevance_score for m in metrics_query) / len(metrics_query)
        avg_grammar = sum(m.grammar_score for m in metrics_query) / len(metrics_query)
        avg_wpm = sum(m.words_per_minute for m in metrics_query) / len(metrics_query)
        
    # Generate filler words trend (last 5 interviews)
    recent_interviews = db.query(models.Interview).filter(models.Interview.status == "Completed").order_by(models.Interview.created_at.asc()).limit(5).all()
    
    filler_words_trend = []
    for index, interview in enumerate(recent_interviews):
        total_fillers = 0
        for resp in interview.responses:
            if resp.metrics:
                total_fillers += resp.metrics.filler_words_count
        
        date_str = interview.created_at.strftime("%b %d")
        filler_words_trend.append({
            "date": f"{date_str} (#{index + 1})",
            "count": str(total_fillers)
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
