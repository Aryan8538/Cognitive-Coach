import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import IntegrityError
from config import ALLOWED_ORIGINS, ALLOWED_ORIGIN_REGEX
from database import engine, Base, SessionLocal
import models
from router import interviews, analyze, chat, auth, resume

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CognitiveCoach API",
    description="Multimodal AI Mock Interview & Diagnostics Platform Backend",
    version="1.0.0"
)

# CORS configuration
# Read allowed origins from environment (comma-separated), default to local hosts
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.29.112:3000",
]
if ALLOWED_ORIGINS:
    for origin in ALLOWED_ORIGINS.split(","):
        stripped = origin.strip()
        if stripped and stripped != "*":
            allowed_origins.append(stripped)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    # Regex allows the deployed Vercel frontend (production *.vercel.app) plus
    # all preview deployment subdomains, which cannot be listed statically.
    allow_origin_regex=ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed database questions if empty
def seed_questions():
    db = SessionLocal()
    try:
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
            },
            {
                "role": "AI Engineer",
                "topic": "Deep Learning",
                "difficulty": "Hard",
                "text": "Explain the architecture of a Transformer model, specifically the role of the Self-Attention mechanism, and how multi-head attention improves representation learning.",
                "suggested_keywords": "self-attention, query key value, multi-head attention, scaling factor, feed-forward, positional encoding"
            },
            {
                "role": "AI Engineer",
                "topic": "LLM Fine-Tuning",
                "difficulty": "Medium",
                "text": "What is the difference between fine-tuning a pre-trained Large Language Model (LLM) and using Retrieval-Augmented Generation (RAG)? In what scenarios would you choose one over the other?",
                "suggested_keywords": "fine-tuning, RAG, knowledge cutoff, hallucination, domain adaptation, vector database, context window"
            },
            {
                "role": "Data Scientist",
                "topic": "Feature Engineering",
                "difficulty": "Medium",
                "text": "Describe the bias-variance tradeoff in machine learning. How do different regularization techniques like L1 (Lasso) and L2 (Ridge) affect this tradeoff?",
                "suggested_keywords": "bias-variance, underfitting, overfitting, regularization, L1 Lasso, L2 Ridge, sparsity"
            },
            {
                "role": "Data Scientist",
                "topic": "A/B Testing",
                "difficulty": "Hard",
                "text": "How would you design an A/B test for a new feature on a high-traffic web application? Discuss sample size calculation, statistical significance, and handling network effects.",
                "suggested_keywords": "A/B testing, statistical power, p-value, sample size, minimum detectable effect, network effects, Type I error"
            },
            {
                "role": "IoT Engineer",
                "topic": "Firmware Design",
                "difficulty": "Medium",
                "text": "How does the MQTT protocol work, and why is it preferred over HTTP for low-bandwidth, constrained IoT devices? Explain its Quality of Service (QoS) levels.",
                "suggested_keywords": "MQTT, publish subscribe, broker, QoS, keep alive, low overhead, TCP IP"
            },
            {
                "role": "IoT Engineer",
                "topic": "Edge Computing",
                "difficulty": "Medium",
                "text": "Explain the key design considerations for writing low-power firmware for an edge micro-controller (e.g., ESP32 or STM32) that runs on battery power.",
                "suggested_keywords": "sleep modes, deep sleep, interrupt driven, watchdog timer, peripheral power gating, battery optimization"
            },
            {
                "role": "DevOps Engineer",
                "topic": "Kubernetes",
                "difficulty": "Medium",
                "text": "Explain the Kubernetes architecture. What are the key components of the control plane and worker nodes, and how does a Pod get scheduled?",
                "suggested_keywords": "control plane, API server, etcd, scheduler, controller manager, kubelet, kube-proxy, pod, worker node"
            },
            {
                "role": "DevOps Engineer",
                "topic": "CI/CD Pipelines",
                "difficulty": "Medium",
                "text": "What is GitOps, and how does it differ from traditional CI/CD pipelines? Explain how tools like ArgoCD or FluxCD maintain state synchronization.",
                "suggested_keywords": "GitOps, continuous delivery, declarative state, reconciliation loop, ArgoCD, FluxCD, single source of truth"
            },
            {
                "role": "Cybersecurity Engineer",
                "topic": "Threat Modeling",
                "difficulty": "Medium",
                "text": "Explain how SQL Injection (SQLi) and Cross-Site Scripting (XSS) attacks work. How do you secure a web application against them?",
                "suggested_keywords": "SQL injection, XSS, input sanitization, parameterized queries, prepared statements, content security policy, escaping"
            },
            {
                "role": "Cybersecurity Engineer",
                "topic": "Penetration Testing",
                "difficulty": "Medium",
                "text": "Describe the differences between symmetric and asymmetric encryption. How are both used together in the TLS/SSL handshake protocol?",
                "suggested_keywords": "symmetric, asymmetric, public key, private key, AES, RSA, TLS handshake, session key"
            },
            {
                "role": "Mobile Engineer",
                "topic": "App Lifecycle",
                "difficulty": "Medium",
                "text": "Explain the mobile application lifecycle states (e.g., Active, Background, Suspended). How do you handle state preservation and data persistence when an app is killed?",
                "suggested_keywords": "app lifecycle, background state, state preservation, async storage, SQLite, data persistence, suspended"
            },
            {
                "role": "Mobile Engineer",
                "topic": "State Management",
                "difficulty": "Medium",
                "text": "Compare native mobile development (Swift/Kotlin) with cross-platform frameworks (React Native/Flutter). What are the trade-offs regarding performance and development speed?",
                "suggested_keywords": "native development, cross-platform, React Native, Flutter, JS bridge, hot reload, performance, UI rendering"
            }
        ]
        # Fetch all already-seeded question texts in one query instead of a
        # per-question SELECT, then bulk-add only the missing ones.
        all_texts = [q_data["text"] for q_data in default_questions]
        existing_texts = {
            row[0]
            for row in db.query(models.Question.text)
            .filter(models.Question.text.in_(all_texts))
            .all()
        }
        seeded_count = 0
        for q_data in default_questions:
            if q_data["text"] not in existing_texts:
                db.add(models.Question(**q_data))
                seeded_count += 1
        if seeded_count > 0:
            try:
                db.commit()
                logger.info("Successfully seeded %d new questions.", seeded_count)
            except IntegrityError:
                db.rollback()
                logger.info("Question seeding skipped (concurrently seeded by another worker).")
    finally:
        db.close()

seed_questions()

# Mount uploaded videos directory for static access
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(interviews.router, prefix="/api", tags=["interviews"])
app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(resume.router, prefix="/api", tags=["resume"])

@app.get("/")
def read_root():
    return {"message": "Welcome to CognitiveCoach API. Use /docs for Swagger documentation."}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Backend is running"}
