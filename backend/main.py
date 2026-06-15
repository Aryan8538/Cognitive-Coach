import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base, SessionLocal
import models
from router import interviews, analyze, chat

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CognitiveCoach API",
    description="Multimodal AI Mock Interview & Diagnostics Platform Backend",
    version="1.0.0"
)

# CORS configuration
# Read allowed origins from environment (comma-separated), default to "*" for local dev
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")] if allowed_origins_env else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed database questions if empty
def seed_questions():
    db = SessionLocal()
    try:
        if db.query(models.Question).count() == 0:
            default_questions = [
                {
                    "role": "Software Engineer",
                    "topic": "System Design",
                    "difficulty": "Medium",
                    "text": "How would you design a URL shortening service like Bit.ly? Discuss the scaling strategy, database choice, and cache layer.",
                    "suggested_keywords": "caching, Redis, hashing, Base62, database sharding, horizontal scaling, redirect code 302"
                },
                {
                    "role": "Software Engineer",
                    "topic": "Coding Logic",
                    "difficulty": "Easy",
                    "text": "Given an array of integers, how would you find two numbers that add up to a specific target? Explain your approach and state the time and space complexity.",
                    "suggested_keywords": "hash map, O(N) time, O(N) space, complement, two sum, lookup"
                },
                {
                    "role": "Software Engineer",
                    "topic": "Coding Logic",
                    "difficulty": "Easy",
                    "text": "Write a function in your preferred language to check if a given string is a valid palindrome, ignoring capitalization, spaces, and punctuation. Explain your approach and state the time and space complexity.",
                    "suggested_keywords": "two pointers, O(N) time, O(1) space, palindrome, clean string, character check"
                },
                {
                    "role": "Software Engineer",
                    "topic": "Coding Logic",
                    "difficulty": "Medium",
                    "text": "Given two sorted integer arrays nums1 and nums2, merge nums2 into nums1 as one sorted array. Explain your two-pointer approach and state time/space complexity.",
                    "suggested_keywords": "merge sorted array, two pointers, O(N+M) time, O(1) space, in-place, reverse iteration"
                },
                {
                    "role": "Product Manager",
                    "topic": "Product Strategy",
                    "difficulty": "Hard",
                    "text": "Your team is launching a subscription model for a popular fitness app. How would you determine the price point, and what metrics would you track to measure launch success?",
                    "suggested_keywords": "A/B testing, churn rate, LTV, CAC, user retention, cohort analysis, conversion funnel"
                },
                {
                    "role": "Behavioral",
                    "topic": "Conflict Resolution",
                    "difficulty": "Medium",
                    "text": "Describe a time when you had a severe disagreement with a teammate or project partner. How did you resolve the conflict, and what was the outcome?",
                    "suggested_keywords": "STAR method, active listening, compromise, resolution, project delivery, collaboration"
                },
                {
                    "role": "Full Stack Web Developer",
                    "topic": "Coding Logic",
                    "difficulty": "Medium",
                    "text": "Implement a REST API endpoint in your preferred framework (e.g., Express/Node, FastAPI) that fetches a paginated list of users from a database, handles search queries, and prevents SQL injection. Walk through your implementation and state its complexity.",
                    "suggested_keywords": "pagination, SQL injection, query parameters, route handler, error handling, database query"
                }
            ]
            for q_data in default_questions:
                question = models.Question(**q_data)
                db.add(question)
            db.commit()
            print("Successfully seeded questions database.")
    finally:
        db.close()

seed_questions()

# Mount uploaded videos directory for static access
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(interviews.router, prefix="/api", tags=["interviews"])
app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(chat.router, prefix="/api", tags=["chat"])

@app.get("/")
def read_root():
    return {"message": "Welcome to CognitiveCoach API. Use /docs for Swagger documentation."}
