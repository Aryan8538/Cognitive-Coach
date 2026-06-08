# CognitiveCoach 🎙️🤖
> **AI-Powered Mock Interview & Communication Diagnostics Platform**
> *B.Tech Computer Science Capstone Project*

CognitiveCoach is a full-stack web application designed to help students master placement interviews. The platform allows users to choose specific job roles (Software Engineer, Product Manager, Data Analyst, Behavioral), record video responses to practice questions, and receive detailed diagnostics (speech pace, filler word counters, clarity/grammar scores, technical relevance, and AI model suggested answers).

---

## 🏗️ System Architecture

```
                    ┌────────────────────────┐
                    │     User Browser       │
                    └───────────┬────────────┘
                                │ WebRTC Video Capture
                                ▼
                    ┌────────────────────────┐
                    │    Next.js Frontend    │ (TypeScript, React)
                    └───────────┬────────────┘
                                │ Upload WebM File (HTTP Form)
                                ▼
                    ┌────────────────────────┐
                    │    FastAPI Backend     │ (Python 3.9+)
                    └─────┬──────────┬───────┘
                          │          │
        If Key Present    │          │  No Key (Sandbox Mode)
        ┌─────────────────┘          └────────────────┐
        ▼                                             ▼
  ┌───────────┐                                 ┌───────────┐
  │Gemini API │ (Transcription & Evaluator)     │Local Regex│ (Mock Analytics Engine)
  └───────────┘                                 └───────────┘
        │                                             │
        └─────────────────┬───────────────────────────┘
                          │ Save Results
                          ▼
                    ┌───────────┐
                    │SQLite DB  │ (coach.db)
                    └───────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **Next.js (v15)** | Full-stack framework, App Router, TypeScript |
| **Icons** | **Lucide React** | Premium icon pack |
| **Styling** | **Vanilla CSS Modules** | Custom theme (Glassmorphism, Indigo/Cyan accents) |
| **Backend** | **FastAPI** | Fast, asynchronous REST API framework |
| **Database** | **SQLite + SQLAlchemy** | Local database persistence, migration-free setup |
| **Media Processing** | **Web Audio API** | Real-time browser audio levels visualization |
| **AI Integration** | **Google Gemini 1.5 Flash** | Audio-to-Text translation & feedback grading |

---

## 📂 Project Directory Structure

```
cognitive-coach/
├── backend/
│   ├── main.py            # FastAPI Entrypoint & Database Seeding
│   ├── database.py        # SQLite SQLAlchemy configuration
│   ├── models.py          # SQLAlchemy ORM Tables (Users, Questions, Metrics)
│   ├── schemas.py         # Pydantic validation schemas
│   ├── router/
│   │   ├── interviews.py  # Question queries & stats dashboard endpoints
│   │   └── analyze.py     # Video upload & AI evaluation endpoint
│   ├── services/
│   │   ├── transcribe.py  # Audio transcription (Gemini File API or Mock)
│   │   └── evaluator.py   # AI response grading (Gemini API JSON Mode or Mock)
│   ├── uploads/           # Directory where recorded WebM videos are stored
│   ├── .env               # Local environment variables
│   └── requirements.txt   # Python packages
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Dashboard, SVG charts, and role selector
│   │   │   ├── interview/        # Interactive interview room with question walk-through
│   │   │   └── results/[id]/     # Metrics scorecard, video review, and transcripts
│   │   ├── components/
│   │   │   └── VideoRecorder.tsx # Camera/Microphone recorder & Audio visualizer
│   │   └── styles/
│   │       └── globals.css       # Core theme styling (Glassmorphism layout)
│
└── README.md              # Project Documentation
```

---

## ⚡ Setup & Installation

### Prerequisite Checklist
*   **Python 3.9+** installed on your system.
*   **Node.js v18.0+** and **npm** installed.

---

### Step 1: Set up the Backend

1. Navigate to the `backend/` directory in your terminal:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows (Command Prompt):
   venv\Scripts\activate
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   ```
3. Install the backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The backend will boot up at `http://localhost:8000`. Database tables will automatically initialize and seed standard questions.*

---

### Step 2: Set up the Frontend

1. Open a new terminal window and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Boot the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend application will now be running locally at `http://localhost:3000`.*

---

## 🧠 AI Modes: Sandbox vs. Live Mode

By default, CognitiveCoach starts in **Sandbox Mode** so it can be demonstrated offline with zero setup.

### 1. Sandbox Mode (Zero-Config / Offline)
*   **Trigger:** When `GEMINI_API_KEY` is empty or omitted from the backend `.env` file.
*   **Behavior:** Video uploads are processed locally. Speaking rates (WPM) and filler words count are computed using deterministic regex and mathematical formulas. Evaluator diagnostics and exemplar responses are matched contextually to the question.
*   *Ideal for live college project demonstrations where network connectivity is unpredictable.*

### 2. Live Mode (Actual AI Integration)
*   **Trigger:** Provide your API Key in `backend/.env`.
*   **Setup:** Open `backend/.env` and insert your Google Gemini key:
    ```env
    GEMINI_API_KEY=AIzaSyD...your_actual_api_key...
    ```
*   **Behavior:** WebM files are uploaded to the Gemini File API. The platform runs transcription and detailed grading parameters on live LLMs in real-time.
