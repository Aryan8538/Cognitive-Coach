import os
import shutil
import uuid
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from services.auth import get_current_user_optional, assert_can_access_interview
from services.transcribe import transcribe_audio
from services.evaluator import evaluate_response

logger = logging.getLogger(__name__)

router = APIRouter()

# Create directory to store uploads
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/interviews/{interview_id}/questions/{question_id}/respond", response_model=schemas.ResponseResponse)
def respond_to_question(
    interview_id: str,
    question_id: int,
    duration: float = Form(...),
    video: UploadFile = File(...),
    code: str = Form(None),
    code_language: str = Form(None),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    # 1. Verify interview and question exist
    interview = db.query(models.Interview).filter(models.Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found")

    # Only the owner (or the holder of an anonymous interview's UUID) may respond.
    assert_can_access_interview(interview, current_user)

    question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    # 2. Save video file locally
    file_extension = video.filename.split(".")[-1] if "." in video.filename else "webm"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    video_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
    except Exception:
        logger.exception("Failed to save video upload for interview %s", interview_id)
        raise HTTPException(status_code=500, detail="Failed to save video upload.")

    try:
        # 3. Transcribe audio (mock transcript offline, Gemini upload when live).
        transcript = transcribe_audio(video_path, question.text)

        # 4. Evaluate transcript and compile metrics.
        evaluation = evaluate_response(transcript, question.text, duration, code=code, code_language=code_language)

        # 5. Persist the response and its metrics in a single transaction.
        relative_video_url = f"/uploads/{unique_filename}"
        db_response = models.Response(
            interview_id=interview_id,
            question_id=question_id,
            video_url=relative_video_url,
            transcript=transcript,
            code=code,
            code_language=code_language
        )
        db.add(db_response)
        db.flush()  # populate db_response.id without a separate commit

        db_metric = models.Metric(
            response_id=db_response.id,
            words_per_minute=evaluation["words_per_minute"],
            filler_words_count=evaluation["filler_words_count"],
            filler_words_details=evaluation["filler_words_details"],
            grammar_score=evaluation["grammar_score"],
            relevance_score=evaluation["relevance_score"],
            clarity_score=evaluation["clarity_score"],
            feedback_text=evaluation["feedback_text"],
            suggested_answer=evaluation["suggested_answer"]
        )
        db.add(db_metric)
        db.commit()
        db.refresh(db_response)
    except Exception:
        # Roll back the transaction and remove the orphaned upload so a failed
        # request never leaves a saved video with no matching DB record.
        db.rollback()
        if os.path.exists(video_path):
            try:
                os.remove(video_path)
            except OSError:
                logger.warning("Could not remove orphaned upload %s", video_path)
        logger.exception("Failed to process response for interview %s", interview_id)
        raise HTTPException(status_code=500, detail="Failed to process interview response.")

    return db_response
