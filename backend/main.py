import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base, SessionLocal
import models
from router import interviews, analyze

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CognitiveCoach API",
    description="Multimodal AI Mock Interview & Diagnostics Platform Backend",
    version="1.0.0"
)

# CORS configuration
# Allows requests from Next.js (usually localhost:3000 or localhost:3001)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development, allow all origins.
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
                    "role": "Data Analyst",
                    "topic": "Metrics & Experimentation",
                    "difficulty": "Medium",
                    "text": "Explain what an A/B test is, how you would determine if a change is statistically significant, and what common pitfalls you should avoid.",
                    "suggested_keywords": "p-value, sample size, statistical significance, selection bias, null hypothesis, Type I error"
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

@app.get("/")
def read_root():
    return {"message": "Welcome to CognitiveCoach API. Use /docs for Swagger documentation."}
