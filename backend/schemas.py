from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

# Question schemas
class QuestionBase(BaseModel):
    role: str
    topic: str
    difficulty: str
    text: str
    suggested_keywords: str

class QuestionCreate(QuestionBase):
    pass

class QuestionResponse(QuestionBase):
    id: int

    class Config:
        from_attributes = True

# Metric schemas
class MetricResponse(BaseModel):
    id: int
    response_id: str
    words_per_minute: float
    filler_words_count: int
    filler_words_details: Optional[Dict[str, int]] = None
    grammar_score: int
    relevance_score: int
    clarity_score: int
    feedback_text: Optional[str] = None
    suggested_answer: Optional[str] = None

    class Config:
        from_attributes = True

# Response schemas
class ResponseResponse(BaseModel):
    id: str
    interview_id: str
    question_id: int
    video_url: Optional[str] = None
    transcript: Optional[str] = None
    code: Optional[str] = None
    code_language: Optional[str] = None
    created_at: datetime
    metrics: Optional[MetricResponse] = None

    class Config:
        from_attributes = True

# Interview schemas
class InterviewCreate(BaseModel):
    role: str
    user_id: Optional[int] = None

class InterviewResponse(BaseModel):
    id: str
    user_id: Optional[int] = None
    role: str
    status: str
    created_at: datetime
    responses: List[ResponseResponse] = []

    class Config:
        from_attributes = True

# Summary schemas
class DashboardStats(BaseModel):
    total_interviews: int
    average_clarity: float
    average_relevance: float
    average_grammar: float
    filler_words_trend: List[Dict[str, str]] # list of {"date": "...", "count": X}
    average_wpm: float
