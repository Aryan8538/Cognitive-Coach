import datetime
import uuid
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    interviews = relationship("Interview", back_populates="user")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, index=True)  # e.g., "Software Engineer", "Product Manager", "Data Analyst", "HR"
    topic = Column(String, index=True) # e.g., "System Design", "Behavioral", "Coding Logic"
    difficulty = Column(String)        # e.g., "Easy", "Medium", "Hard"
    text = Column(Text)
    suggested_keywords = Column(Text)  # Comma-separated

    responses = relationship("Response", back_populates="question")

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    role = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="In Progress") # "In Progress", "Completed"

    user = relationship("User", back_populates="interviews")
    responses = relationship("Response", back_populates="interview", cascade="all, delete-orphan")

class Response(Base):
    __tablename__ = "responses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    interview_id = Column(String, ForeignKey("interviews.id", ondelete="CASCADE"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    video_url = Column(String, nullable=True)
    transcript = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    interview = relationship("Interview", back_populates="responses")
    question = relationship("Question", back_populates="responses")
    metrics = relationship("Metric", back_populates="response", uselist=False, cascade="all, delete-orphan")

class Metric(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True)
    response_id = Column(String, ForeignKey("responses.id", ondelete="CASCADE"), unique=True)
    words_per_minute = Column(Float, default=0.0)
    filler_words_count = Column(Integer, default=0)
    filler_words_details = Column(JSON, nullable=True)  # e.g., {"like": 3, "um": 4}
    grammar_score = Column(Integer, default=0)
    relevance_score = Column(Integer, default=0)
    clarity_score = Column(Integer, default=0)
    feedback_text = Column(Text, nullable=True)
    suggested_answer = Column(Text, nullable=True)

    response = relationship("Response", back_populates="metrics")
