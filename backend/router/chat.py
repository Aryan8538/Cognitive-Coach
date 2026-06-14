import os
import requests
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

router = APIRouter()

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    response: str

def generate_advisor_fallback(query: str) -> str:
    """
    Generates high-fidelity mock placement roadmaps and career guidance
    based on student keywords.
    """
    query_lower = query.lower()
    
    if any(k in query_lower for k in ["roadmap", "study", "syllabus", "prepare", "learn"]):
        return (
            "### 🗺️ Software Engineer Placement Roadmap (3-Month Plan)\n\n"
            "Here is a comprehensive week-by-week roadmap to help you prepare for software engineering placements:\n\n"
            "#### **Month 1: Data Structures & Algorithms (DSA)**\n"
            "- **Week 1-2 (Linear DSA):** Arrays, Strings, Hash Maps, and Linked Lists. Master two-pointer, sliding window, and hashing logic.\n"
            "- **Week 3-4 (Non-Linear DSA):** Binary Trees, BSTs, Heaps, and Graphs. Practice DFS and BFS traversals.\n"
            "- *Recommended Practice:* Solve the 'NeetCode 150' list on LeetCode.\n\n"
            "#### **Month 2: Computer Science Core Fundamentals**\n"
            "- **Week 5-6 (OOP & Database Management):** Learn Object-Oriented Design (Inheritance, Polymorphism, Abstraction, Encapsulation). Master SQL Joins, Group By, Indexes, and Transactions.\n"
            "- **Week 7-8 (Operating Systems & Networks):** Process synchronization, CPU scheduling, virtual memory paging, TCP/IP handshake, and HTTP protocols.\n"
            "- *Recommended Tool:* Use SQLZoo or LeetCode Database section to practice SQL queries.\n\n"
            "#### **Month 3: System Design & Mock Interviews**\n"
            "- **Week 9-10 (System Architecture):** Scalability parameters, caching (Redis/Memcached), load balancing, sharding, and database replication.\n"
            "- **Week 11-12 (Mock Interview Drills):** Practice answering behavioral questions using the STAR format. Record webcam mocks using CognitiveCoach to analyze WPM pacing and filler words.\n\n"
            "*(Career Advisor is running in Sandbox mode. Set a live GEMINI_API_KEY in your backend .env file to enable dynamic interactive counseling.)*"
        )
        
    elif any(k in query_lower for k in ["resume", "cv", "project"]):
        return (
            "### 📄 Resume Checklist for Technical Placements\n\n"
            "To ensure your resume passes both ATS filters and recruiter screening, follow these essential design parameters:\n\n"
            "1. **Apply the STAR Method:** For projects and internships, write descriptions in the format: *Action you took* leading to a *Quantified Result*.  \n"
            "   * **Before:** 'Worked on a React dashboard with backend API.'\n"
            "   * **After:** 'Designed a responsive React admin dashboard integrated with FastAPI, reducing page load latency by 35% through Redis caching.'\n"
            "2. **Group Technical Skills:** Organize tech items clearly under sections: *Languages* (Python, C++), *Frameworks* (Next.js, FastAPI), *Databases* (PostgreSQL, SQLite), and *Developer Tools* (Git, Docker).\n"
            "3. **Single-Page Constraint:** Keep your layout strictly to 1 page. Use standard LaTeX Deedy or Jake's Resume formatting (clean margins, sans-serif fonts, no visual skill progress bars).\n"
            "4. **Deploy Your Projects:** Always include clickable hyperlinks to live Vercel deployments and GitHub repositories. A working demo stands out 10x more than text.\n\n"
            "*(Career Advisor is running in Sandbox mode. Set a live GEMINI_API_KEY in your backend .env file to enable dynamic interactive counseling.)*"
        )
        
    elif any(k in query_lower for k in ["placement", "job", "drive", "interview", "hr"]):
        return (
            "### 💼 Technical Placement Prep Checklist\n\n"
            "Ensure you complete these preparation tasks before college placement season begins:\n\n"
            "- **Aptitude Rounds:** Standard screening drives contain Quantitative Aptitude, Logical Reasoning, and Verbal Comprehension. Dedicate 30 minutes daily on IndiaBIX or GeeksforGeeks to practice aptitude.\n"
            "- **CS Fundamentals:** Be ready to write SQL queries involving Joins, Aggregation (Group By/Having), and Subqueries. Be able to explain OOP pillars with code code snippets.\n"
            "- **STAR format for HR rounds:** Prepare answers for standard questions:\n"
            "  * *'Tell me about a time you handled conflict in a group project.'*\n"
            "  * *'What is your greatest technical challenge?'*\n"
            "- **Pacing & Confidence:** Practice mock drills. Speak at a steady rate of 110–140 WPM and keep filler words ('like', 'um', 'actually') under 2–3 per response.\n\n"
            "*(Career Advisor is running in Sandbox mode. Set a live GEMINI_API_KEY in your backend .env file to enable dynamic interactive counseling.)*"
        )
        
    else:
        return (
            "👋 **Hi! I am your CognitiveCoach AI Career Counselor.**\n\n"
            "I can help you build structured roadmaps, refine your projects, review your code, and guide your placement strategy. Ask me questions such as:\n\n"
            "- *'Give me a study roadmap for backend engineering.'*\n"
            "- *'How can I improve my project resume bullet points?'*\n"
            "- *'What topics should I prepare for SQL interview rounds?'*\n\n"
            "Type a career or study-related query in the chat box to begin!"
        )

@router.post("/chat", response_model=ChatResponse)
def get_chat_response(req: ChatRequest):
    if not req.messages:
        raise HTTPException(status_code=400, detail="Message history cannot be empty")
        
    last_user_message = next((m.content for m in reversed(req.messages) if m.role == "user"), None)
    if not last_user_message:
        raise HTTPException(status_code=400, detail="No user message found in history")
        
    if not GEMINI_API_KEY:
        response_text = generate_advisor_fallback(last_user_message)
        return {"response": response_text}
        
    try:
        model = "gemini-1.5-flash"
        generate_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        
        system_prompt = (
            "You are a professional placement coordinator, interview coach, and technical career advisor. "
            "Your job is to help college students prepare for interviews, design roadmaps, recommend study resources, "
            "review coding patterns, and provide guidance for software engineering, product management, data analysis, "
            "and HR roles.\n"
            "Be encouraging, structured, and highly detailed. Use Markdown lists, bold headers, and code snippets where relevant. "
            "If they ask for a roadmap, structure it week-by-week or phase-by-phase with clear topics and free resource links."
        )
        
        # Format conversation history for Gemini
        gemini_contents = []
        # Add system instructions via first message or parameter. 
        # Gemini 1.5 allows system instructions, but for a simple API call we can prepend it to the first message.
        
        # Prepend system instructions to prompt or history
        gemini_contents.append({
            "role": "user",
            "parts": [{"text": f"System Instructions:\n{system_prompt}"}]
        })
        gemini_contents.append({
            "role": "model",
            "parts": [{"text": "Understood. I will act as a career advisor and provide structured, detailed guidance with markdown headings and lists."}]
        })
        
        for msg in req.messages:
            role_map = "user" if msg.role == "user" else "model"
            gemini_contents.append({
                "role": role_map,
                "parts": [{"text": msg.content}]
            })
            
        payload = {
            "contents": gemini_contents
        }
        
        res = requests.post(generate_url, headers={"Content-Type": "application/json"}, json=payload, params={"key": GEMINI_API_KEY})
        
        if res.status_code == 200:
            content = res.json()
            response_text = content["candidates"][0]["content"]["parts"][0]["text"]
            return {"response": response_text}
        else:
            raise Exception(f"Gemini API error: {res.text}")
            
    except Exception as e:
        print(f"Error calling live Gemini chatbot: {e}. Falling back to sandbox counselor.")
        response_text = generate_advisor_fallback(last_user_message)
        return {"response": response_text}
