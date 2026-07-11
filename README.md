# CognitiveCoach 🎙️🤖 
> **AI-Powered Mock Interview & Communication Diagnostics Platform**
> *B.Tech Computer Science Capstone Project*

CognitiveCoach is a full-stack web application designed to help students master technical and behavioral placement interviews. The platform allows users to choose specific job roles (Software Engineer, Product Manager, Data Analyst, Behavioral, etc.), record video responses, and receive real-time diagnostics (speaking pace, filler word counters, clarity/grammar scores, technical relevance, and AI-mode suggested answers).

---

## 🚀 Key Feature Enhancements

1. **Interactive Client-Side Code Execution**: Run Python 3 (compiled directly in the browser via Pyodide WebAssembly runtime) and JavaScript (via a sandboxed runner) to validate coding solutions on mock inputs in real-time.
2. **On-Demand Microphone Calibration**: Test microphone gain levels and inputs prior to starting active recording.
3. **Live Speech Subtitles**: Speech recognition events automatically translate spoken responses into visual overlays as you record.
4. **Restored Member Authentications**: Proper JWT login and signup options to persistent individual user history, with a graceful **"Continue as Guest"** sandbox mode bypass.
5. **Accessibility Compliant (A11y)**: Built-in ARIA progressbar attributes for screen readers, keyboard focus trap escape instructions (`Ctrl + M`), and spacebar controls (`Space` key to start/stop recordings).

---

## 🏗️ System Architecture

```
                    ┌────────────────────────┐
                    │     User Browser       │
                    └───────────┬────────────┘
                                │ WebRTC Video Capture
                                ▼
                    ┌────────────────────────┐
                    │     Next.js Frontend   │ (React, Monaco Editor, Pyodide WASM)
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
                    │SQLite DB  │ (configurable database path or PostgreSQL URL)
                    └───────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **Next.js (v15/16)** | Full-stack framework, App Router, React |
| **Code Editor** | **Monaco Editor + Pyodide** | In-browser editor workspace with WebAssembly Python runtime |
| **Icons & Style**| **Lucide React + Tailwind** | Custom theme (Glassmorphism layout) |
| **Backend** | **FastAPI** | Fast, asynchronous REST API framework |
| **Database** | **SQLite / PostgreSQL** | Database persistence with SQLAlchemy support |
| **Media Processing**| **Web Audio API** | Real-time browser audio levels calibration |
| **AI Integration** | **Google Gemini 1.5 Flash** | Audio-to-Text translation & evaluation |

---

## 📂 Project Directory Structure

```
cognitive-coach/
├── backend/
│   ├── main.py            # FastAPI Entrypoint & Database Seeding
│   ├── database.py        # SQLAlchemy configurations (SQLite or PostgreSQL)
│   ├── models.py          # SQLAlchemy ORM Tables (Users, Questions, Metrics)
│   ├── schemas.py         # Pydantic validation schemas
│   ├── router/
│   │   ├── interviews.py  # Question queries & stats dashboard endpoints
│   │   └── analyze.py     # Video upload & AI evaluation endpoint
│   ├── services/
│   │   ├── auth.py        # JWT token and guest session middleware
│   │   ├── transcribe.py  # Audio transcription (Gemini File API or Mock)
│   │   └── evaluator.py   # AI response grading (Gemini API JSON Mode or Mock)
│   ├── uploads/           # Directory where recorded WebM videos are stored
│   ├── Dockerfile         # Production API build configurations
│   └── requirements.txt   # Python packages
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.jsx          # Dashboard and role selector
│   │   │   ├── interview/        # Interactive interview room (split-screen code sandbox)
│   │   │   └── results/[id]/     # Scorecard, video playback, and highlighted transcripts
│   │   ├── components/
│   │   │   ├── CodeEditor.jsx    # Pyodide script execution playground console
│   │   │   └── VideoRecorder.jsx # Camera preview, subtitles, and mic calibration check
│   │   └── styles/
│   │       └── globals.css       # Custom theme (Glassmorphism layout)
│   └── Dockerfile         # Production client container settings
│
├── docker-compose.yml     # Multi-container launch configuration orchestrator
└── README.md              # Project Documentation
```

---

## ⚡ Setup & Installation

### Option A: Running Containerized with Docker Compose (Recommended)
Launch the entire system locally with one command:
```bash
docker-compose up --build
```
- Frontend will boot up at `http://localhost:3000`.
- Backend will run at `http://localhost:8000`.

### Option B: Local Setup & Manual Run

#### Step 1: Set up the Backend
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

#### Step 2: Set up the Frontend
1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Boot the Next.js development server:
   ```bash
   npm run dev
   ```
   *The client web portal will run locally at `http://localhost:3000`.*

---

## 🧠 AI Modes: Sandbox vs. Live Mode

By default, CognitiveCoach starts in **Sandbox Mode** so it can be demonstrated offline with zero configuration.

### 1. Sandbox Mode (Zero-Config / Offline)
- **Trigger**: When `GEMINI_API_KEY` is omitted or empty.
- **Behavior**: Video uploads are processed locally. Speaking rates (WPM) and filler words count are computed using deterministic mathematical algorithms. Evaluator diagnostics and suggested answers are matched contextually to the question.

### 2. Live Mode (Actual AI Integration)
*   **Trigger:** Provide your API Key in `backend/.env`.
*   **Setup:** Open `backend/.env` and insert your Google Gemini key:
    ```env
    GEMINI_API_KEY=AIzaSyD...your_actual_api_key...
    ```
*   **Behavior:** WebM files are uploaded to the Gemini File API. The platform runs transcription and detailed grading parameters on live LLMs in real-time.

---

## 🌐 Production Deployment

The project is configured for split-tier production deployments of the backend and frontend.

### 1. Backend (FastAPI + Docker) on Render
The backend is dockerized and ready for **Render** using the provided [render.yaml](file:///render.yaml) blueprint or as a manual Web Service:

- **Root Directory**: `backend`
- **Environment**: `Docker`
- **Port**: `8000` (Render automatically routes traffic using the `EXPOSE 8000` instruction in the `Dockerfile`)
- **Important Environment Variables**:
  - `DATABASE_URL`: Your PostgreSQL connection string. 
    > [!IMPORTANT]
    > Since Render does not support outbound IPv6 connections on standard/free instances, if you are using Supabase, you must use their **Connection Pooler URL** (e.g. `aws-1-ap-northeast-1.pooler.supabase.com` on port `5432`) which resolves to IPv4 instead of the direct connection string.
  - `GEMINI_API_KEY`: Your Google Gemini API Key.
  - `JWT_SECRET`: A secure random string for signing backend tokens.
  - `SUPABASE_JWT_SECRET`: Your Supabase Project JWT Secret to authenticate clients.

### 2. Frontend (Next.js) on Vercel
The React application can be deployed directly to **Vercel**:

- **Root Directory**: `frontend`
- **Framework Preset**: `Next.js` (automatically detected)
- **Environment Variables**:
  - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon publishable key.
  - `NEXT_PUBLIC_API_URL`: The URL of your deployed Render backend (e.g. `https://cognitive-coach-backend.onrender.com`).

