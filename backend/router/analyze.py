import os
import shutil
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from services.transcribe import transcribe_audio
from services.evaluator import evaluate_response

router = APIRouter()

# Create directory to store uploads
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/interviews/{interview_id}/questions/{question_id}/respond", response_model=schemas.ResponseResponse)
async def respond_to_question(
    interview_id: str,
    question_id: int,
    duration: float = Form(...),
    video: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. Verify interview and question exist
    interview = db.query(models.Interview).filter(models.Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found")
        
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save video upload: {str(e)}")
        
    # 3. Transcribe audio
    # Under mock, this will give mock transcript based on question text.
    # Under live mode, it will upload file to Gemini.
    transcript = transcribe_audio(video_path, question.text)
    
    # 4. Evaluate transcript and compile metrics
    evaluation = evaluate_response(transcript, question.text, duration)
    
    # 5. Save Response to DB
    relative_video_url = f"/uploads/{unique_filename}"
    db_response = models.Response(
        interview_id=interview_id,
        question_id=question_id,
        video_url=relative_video_url,
        transcript=transcript
    )
    db.add(db_response)
    db.commit()
    db.refresh(db_response)
    
    # 6. Save Metrics to DB
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
    
    return db_response
