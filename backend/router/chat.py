import os
import logging
import requests
import json
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

logger = logging.getLogger(__name__)

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
    
    # 1. Reversing a Binary Tree
    if any(k in query_lower for k in ["reverse", "invert"]) and "tree" in query_lower:
        return (
            "### 🌳 Reversing a Binary Tree (Inverting a Binary Tree)\n\n"
            "To invert/reverse a binary tree, you swap the left and right children for every node recursively.\n\n"
            "#### **Recursive Python Approach (O(N) Time, O(H) Space)**\n"
            "```python\n"
            "class TreeNode:\n"
            "    def __init__(self, val=0, left=None, right=None):\n"
            "        self.val = val\n"
            "        self.left = left\n"
            "        self.right = right\n\n"
            "def invertTree(root: TreeNode) -> TreeNode:\n"
            "    if not root:\n"
            "        return None\n"
            "    \n"
            "    # Swap the left and right subtrees\n"
            "    root.left, root.right = invertTree(root.right), invertTree(root.left)\n"
            "    return root\n"
            "```\n\n"
            "#### **Complexity Bounds**\n"
            "- **Time Complexity:** `O(N)` since we visit each of the $N$ nodes exactly once.\n"
            "- **Space Complexity:** `O(H)` where $H$ is the tree height, representing call stack frames.\n\n"
            "*(Career Advisor is running in Sandbox mode. Set a live GEMINI_API_KEY in your backend .env file to enable dynamic interactive counseling.)*"
        )

    # 2. Arrays vs Linked Lists
    elif "array" in query_lower and any(k in query_lower for k in ["list", "linked list"]):
        return (
            "### 📊 Array vs Linked List Comparison\n\n"
            "Both store linear collections, but differ in memory allocation and performance:\n\n"
            "| Feature | Array | Linked List |\n"
            "|---------|-------|-------------|\n"
            "| **Memory** | Contiguous block | Non-contiguous (nodes + pointers) |\n"
            "| **Size** | Fixed (on creation) | Dynamic (grows at runtime) |\n"
            "| **Access** | `O(1)` (Random access) | `O(N)` (Sequential traversal) |\n"
            "| **Insert/Delete** | `O(N)` (Requires shifting elements) | `O(1)` (If pointer is known) |\n"
            "| **Overhead** | No extra metadata | Pointer storage for every element |\n\n"
            "#### **SDE Tips:**\n"
            "- Use **Arrays** for lookup-heavy operations.\n"
            "- Use **Linked Lists** for write-heavy stacks, queues, or buffer pools.\n\n"
            "*(Career Advisor is running in Sandbox mode. Set a live GEMINI_API_KEY in your backend .env file to enable dynamic interactive counseling.)*"
        )

    # 3. Sliding Window
    elif "sliding window" in query_lower or ("window" in query_lower and "array" in query_lower):
        return (
            "### 🎛️ Sliding Window Coding Pattern\n\n"
            "The sliding window pattern optimizes nested loops in array/string sub-segments from `O(N^2)` to `O(N)` linear time.\n\n"
            "#### **Variable Window Template (Python)**\n"
            "```python\n"
            "def sliding_window(arr):\n"
            "    left = 0\n"
            "    max_length = 0\n"
            "    current_state = {}\n"
            "    \n"
            "    for right in range(len(arr)):\n"
            "        # Expand the window: Add arr[right] to state\n"
            "        # ...\n"
            "        \n"
            "        # Shrink the window: If state is invalid\n"
            "        while state_invalid(current_state):\n"
            "            # Remove arr[left] from state\n"
            "            left += 1\n"
            "            \n"
            "        max_length = max(max_length, right - left + 1)\n"
            "        \n"
            "    return max_length\n"
            "```\n\n"
            "#### **Common LeetCode Applications**\n"
            "- Longest Substring Without Repeating Characters\n"
            "- Minimum Window Substring\n"
            "- Maximum Sum Subarray of Size K\n\n"
            "*(Career Advisor is running in Sandbox mode. Set a live GEMINI_API_KEY in your backend .env file to enable dynamic interactive counseling.)*"
        )

    # 4. Dynamic Programming
    elif "dynamic programming" in query_lower or "dp" in query_lower:
        return (
            "### 🧠 Dynamic Programming (DP) Interview prep\n\n"
            "Dynamic Programming optimizes plain recursion by solving overlapping subproblems exactly once and storing their results (caching).\n\n"
            "#### **Two Approaches to Master:**\n"
            "1. **Memoization (Top-Down):** Start from target problem, recurse down, caching results in a hash map/array.\n"
            "2. **Tabulation (Bottom-Up):** Initialize a table (`dp` array), solve base cases, and iterate up.\n\n"
            "#### **Essential DP Patterns:**\n"
            "- **0/1 Knapsack:** Partition Equal Subset Sum, Target Sum.\n"
            "- **Unbounded Knapsack:** Coin Change, Rod Cutting.\n"
            "- **LCS (Longest Common Subsequence):** Edit Distance, Longest Palindromic Substring.\n"
            "- **LIS (Longest Increasing Subsequence):** Russian Doll Envelopes.\n\n"
            "*(Career Advisor is running in Sandbox mode. Set a live GEMINI_API_KEY in your backend .env file to enable dynamic interactive counseling.)*"
        )

    # 5. OOP Pillars
    elif any(k in query_lower for k in ["oop", "oops", "object oriented"]):
        return (
            "### 📦 Object-Oriented Programming (OOP) Pillars\n\n"
            "Be ready to define and give code examples of these 4 primary pillars:\n\n"
            "1. **Encapsulation:** Grouping variables and methods into a single class unit, and protecting access (via `private` or `protected` specifiers).\n"
            "2. **Abstraction:** Hiding complex implementation details behind a clean, simple interface (e.g., using `interface` in Java or abstract base classes in Python).\n"
            "3. **Inheritance:** Enabling a class to inherit properties/methods from a parent class, promoting DRY code reusability.\n"
            "4. **Polymorphism:** Having one interface behave differently: \n"
            "   - *Compile-Time:* Method overloading (different parameters).\n"
            "   - *Run-Time:* Method overriding (parent function replaced by child subclass version).\n\n"
            "*(Career Advisor is running in Sandbox mode. Set a live GEMINI_API_KEY in your backend .env file to enable dynamic interactive counseling.)*"
        )

    # Existing category roadmaps and fallbacks
    elif any(k in query_lower for k in ["full stack", "web", "react", "frontend", "node", "javascript"]):
        return (
            "### 🌐 Full Stack Web Developer Placement Roadmap (3-Month Plan)\n\n"
            "Here is a targeted full-stack preparation guide for technical placements:\n\n"
            "#### **Month 1: Frontend Architecture & Client Optimization**\n"
            "- **Core Concepts:** HTML5/CSS3 semantic layouts, ES6+ JavaScript. State management (Zustand, Redux Toolkit). React.js & Next.js App Router.\n"
            "- **Interview Questions:** Walk through Client-Side Rendering (CSR) vs. Server-Side Rendering (SSR) page-load differences, hydration stages, React component re-rendering triggers.\n"
            "- **Resources:** freeCodeCamp, MDN Web Docs, Next.js official learn portal.\n\n"
            "#### **Month 2: Backend Frameworks & Database Scaling**\n"
            "- **Core Concepts:** Node.js event loops, Express/FastAPI middlewares, REST API conventions, database queries, and pagination logic.\n"
            "- **Interview Questions:** Explain how database indexes optimize queries. Walk through route handlers that protect against SQL Injection using parameterized inputs.\n"
            "- **Resources:** Official Node.js guides, database index scanning documents.\n\n"
            "#### **Month 3: System Design, Cache & Mock Mocks**\n"
            "- **Core Concepts:** Caching strategies (Redis/Memcached), CDNs, database sharding, normalizations (1NF, 2NF, 3NF), and message queues (Kafka).\n"
            "- **Mock Practice:** Code full-stack API controllers inside Monaco playground and explain space/time complexity bounds.\n\n"
            "*(Career Advisor is running in Sandbox mode. Set a live GEMINI_API_KEY in your backend .env file to enable dynamic interactive counseling.)*"
        )
        
    elif any(k in query_lower for k in ["database", "sql", "query"]):
        return (
            "### 🗄️ Database & SQL Interview Guide\n\n"
            "Prepare the following core areas to clear SDE database rounds:\n\n"
            "#### **1. SQL Query Drills (Mandatory)**\n"
            "- Practice query operations involving `INNER JOIN`, `LEFT JOIN`, `GROUP BY`, `HAVING`, and nested subqueries.\n"
            "- Master analytical window functions like `ROW_NUMBER()`, `RANK()`, and `DENSE_RANK()`.\n"
            "- *Practice platforms:* SQLZoo, LeetCode Database, HackerRank SQL.\n\n"
            "#### **2. DBMS Internals & Theory**\n"
            "- **ACID Properties:** Atomicity, Consistency, Isolation, Durability. Explain transaction logs and concurrency lock states.\n"
            "- **Database Indexes:** B-Trees vs. Hash maps. Understand query optimization, index scans, and composite indexes.\n"
            "- **Normalizations:** 1NF, 2NF, 3NF, and BCNF tables. Know when to denormalize schemas for query speed.\n\n"
            "*(Career Advisor is running in Sandbox mode. Set a live GEMINI_API_KEY in your backend .env file to enable dynamic interactive counseling.)*"
        )
 
    elif any(k in query_lower for k in ["system design", "architecture", "scale", "system"]):
        return (
            "### 🏗️ SDE System Design Preparation Framework\n\n"
            "When answering System Design questions, structure your thoughts with this structured framework:\n\n"
            "#### **Step 1: Feature & Constraint Estimation**\n"
            "- Ask clarifying questions. Establish Daily Active Users (DAU), read/write ratios, and scale parameters.\n"
            "- Calculate approximate storage, bandwidth, and CPU capacity bounds (QPS).\n\n"
            "#### **Step 2: High-Level Architecture**\n"
            "- Define request flows from DNS/CDN, API Gateway, Load Balancers, Web Servers, microservices, and database layers.\n\n"
            "#### **Step 3: Component Deep-Dive**\n"
            "- **Caching:** Add a Redis layer for hot key/value storage.\n"
            "- **Scaling:** Horizontal database sharding based on partition keys.\n"
            "- **Availability:** Set up read replicas and database mirroring.\n\n"
            "*(Career Advisor is running in Sandbox mode. Set a live GEMINI_API_KEY in your backend .env file to enable dynamic interactive counseling.)*"
        )
 
    elif any(k in query_lower for k in ["roadmap", "study", "prepare", "learn", "software", "sde", "coding", "dsa"]):
        return (
            "### 💻 Software Engineer (SDE) Preparation Roadmap\n\n"
            "A structured week-by-week SDE placement study guide:\n\n"
            "#### **Phase 1: Advanced DSA (Weeks 1-6)**\n"
            "- Master arrays, two pointers, sliding windows, hash maps, linked lists, trees, binary search, and heaps.\n"
            "- Practice recursion, back-tracking, and dynamic programming fundamentals.\n"
            "- *Target list:* Settle the 'NeetCode 150' list on LeetCode.\n\n"
            "#### **Phase 2: CS Core Systems (Weeks 7-10)**\n"
            "- **Operating Systems:** Process scheduling, virtual memory paging, multithreading, and lock states.\n"
            "- **Computer Networks:** TCP/IP handshake, DNS resolution process, OSI model layers, HTTP/HTTPS methods.\n"
            "- **Object-Oriented Design (OOP):** Inheritance, polymorphism, encapsulation, and abstraction.\n\n"
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
        
    elif any(k in query_lower for k in ["placement", "job", "drive", "interview", "hr", "behavioral", "conflict", "star"]):
        return (
            "### 💼 Behavioral Round prep Checklist (STAR Method)\n\n"
            "Structure your behavioral responses using the **STAR Method** (Situation, Task, Action, Result):\n\n"
            "- **Situation:** Contextualize the challenge. Be brief (e.g., 'In a group project, our team conflicted on database selection').\n"
            "- **Task:** Define your role/objective (e.g., 'As lead, my goal was to resolve the dispute without project delays').\n"
            "- **Action:** Specify the exact steps you personally took (e.g., 'I built a benchmark script and compiled latencies for PostgreSQL and MongoDB').\n"
            "- **Result:** Detail the outcome with metrics (e.g., 'empirical benchmarks resolved the dispute, saving 3 days of development').\n\n"
            "*(Career Advisor is running in Sandbox mode. Set a live GEMINI_API_KEY in your backend .env file to enable dynamic interactive counseling.)*"
        )
        
    elif any(k in query_lower for k in ["ai engineer", "machine learning", "deep learning", "transformer", "llm"]):
        return (
            "### 🤖 AI Engineer Placement Roadmap (3-Month Plan)\n\n"
            "Here is a targeted AI & Machine Learning preparation guide:\n\n"
            "#### **Month 1: Mathematics & Core ML Models**\n"
            "- **Concepts:** Linear Algebra, Calculus, Probability, and Statistics.\n"
            "- **Algorithms:** Linear/Logistic Regression, Decision Trees, Random Forests, SVMs, and K-Means.\n"
            "- **Interview Questions:** Explain bias-variance tradeoff, gradient descent mechanics, and L1 vs L2 regularization.\n\n"
            "#### **Month 2: Deep Learning & Neural Architectures**\n"
            "- **Concepts:** Feedforward networks, Backpropagation, CNNs for vision, and RNNs/LSTMs for sequences.\n"
            "- **Optimization:** Adam vs SGD, Dropout, Batch Normalization, and activation functions (ReLU, GELU).\n"
            "- **Hands-on:** PyTorch/TensorFlow custom training loops.\n\n"
            "#### **Month 3: Transformers & LLMs**\n"
            "- **Concepts:** Self-attention mechanism, Query-Key-Value matrices, and Positional Encodings.\n"
            "- **LLMs:** Parameter-Efficient Fine-Tuning (LoRA, QLoRA) and Retrieval-Augmented Generation (RAG).\n"
            "- **Mocks:** Design vector database search architectures and explain compute bounds.\n\n"
            "*(Career Advisor is running in Sandbox mode. Set a live GEMINI_API_KEY in your backend .env file to enable dynamic interactive counseling.)*"
        )
        
    elif any(k in query_lower for k in ["iot", "internet of things", "firmware", "sensor", "embedded"]):
        return (
            "### 🔌 IoT Engineer Placement Roadmap (3-Month Plan)\n\n"
            "Here is a targeted IoT & Embedded Systems preparation guide:\n\n"
            "#### **Month 1: Microcontroller Architectures & Electronics**\n"
            "- **Core:** GPIO, interrupts, timers, ADC/DAC conversions, and microcontroller architectures (ARM Cortex, ESP32).\n"
            "- **Protocols:** I2C, SPI, UART serial communication protocols.\n"
            "- **Tools:** Oscilloscopes, logic analyzers, and breadboard prototyping.\n\n"
            "#### **Month 2: Low-Power Firmware & Real-Time OS**\n"
            "- **RTOS:** Tasks, queues, semaphores, mutexes, and scheduling algorithms in FreeRTOS.\n"
            "- **Low-Power:** Deep sleep configurations, wake-up sources, and peripheral power gating.\n"
            "- **Interview Questions:** Discuss memory leak prevention in embedded C and interrupt handler execution boundaries.\n\n"
            "#### **Month 3: Network Protocols & Cloud Integration**\n"
            "- **Connectivity:** Wi-Fi, Bluetooth Low Energy (BLE), Zigbee, LoRaWAN.\n"
            "- **Protocols:** MQTT, CoAP, HTTP, and WebSockets. Broker architectures (Mosquitto).\n"
            "- **IoT Cloud:** AWS IoT Core, Azure IoT Hub, device provisioning, and security (certificates, TLS).\n\n"
            "*(Career Advisor is running in Sandbox mode. Set a live GEMINI_API_KEY in your backend .env file to enable dynamic interactive counseling.)*"
        )
        
    elif any(k in query_lower for k in ["data science", "data scientist", "stats", "a/b test"]):
        return (
            "### 📊 Data Scientist Placement Roadmap (3-Month Plan)\n\n"
            "Here is a targeted Data Science preparation guide:\n\n"
            "#### **Month 1: SQL & Data Wrangling**\n"
            "- **SQL:** Window functions (`DENSE_RANK`), complex joins, subqueries, and database performance tuning.\n"
            "- **Wrangling:** Pandas, NumPy, data cleaning, handling missing values, and outlier detection.\n"
            "- **Interview Questions:** Write optimized window queries and explain database query plans.\n\n"
            "#### **Month 2: Applied Statistics & A/B Testing**\n"
            "- **Stats:** Hypothesis testing, p-values, Central Limit Theorem, confidence intervals, and probability distributions.\n"
            "- **A/B Testing:** Minimum detectable effect, sample size calculation, statistical power, Type I/II errors, and split testing.\n"
            "- **Interview Questions:** How do you design an A/B test for a new landing page and handle network effects?\n\n"
            "#### **Month 3: Predictive Modeling & ML Pipelines**\n"
            "- **Modeling:** Feature engineering, cross-validation, hyperparameter tuning (GridSearch/Optuna).\n"
            "- **Evaluation:** ROC-AUC, Precision-Recall curves, F1-score, and confusion matrix.\n"
            "- **Mocks:** Walk through complete model deployment pipelines and monitor feature drift.\n\n"
            "*(Career Advisor is running in Sandbox mode. Set a live GEMINI_API_KEY in your backend .env file to enable dynamic interactive counseling.)*"
        )
        
    elif any(k in query_lower for k in ["devops", "kubernetes", "terraform", "docker", "pipeline", "ci/cd"]):
        return (
            "### ♾️ DevOps & Cloud Engineer Placement Roadmap (3-Month Plan)\n\n"
            "Here is a targeted DevOps & Cloud Systems preparation guide:\n\n"
            "#### **Month 1: Linux Administration & Containerization**\n"
            "- **OS:** Linux system administration, shell scripting (Bash), networking, process management, and permissions.\n"
            "- **Docker:** Building optimized multi-stage Dockerfiles, managing volumes, networks, and Docker Compose orchestration.\n"
            "- **Interview Questions:** Explain container namespaces, cgroups, and how to reduce image size.\n\n"
            "#### **Month 2: Orchestration & Infrastructure as Code (IaC)**\n"
            "- **Kubernetes:** Control plane components, worker nodes, Pods, Deployments, Services, Ingress, and ConfigMaps.\n"
            "- **Terraform:** Declarative infrastructure config, state management, modules, and multi-provider deployments.\n"
            "- **Interview Questions:** Walk through a Kubernetes Pod scheduling cycle and explain state-lock in Terraform.\n\n"
            "#### **Month 3: CI/CD, GitOps & Observability**\n"
            "- **CI/CD:** GitHub Actions, GitLab CI, or Jenkins pipelines. Automating tests, builds, and artifact registries.\n"
            "- **GitOps:** ArgoCD or FluxCD declarative state synchronization.\n"
            "- **Observability:** Prometheus, Grafana, ELK stack (Elasticsearch, Logstash, Kibana) metrics/logs monitoring.\n\n"
            "*(Career Advisor is running in Sandbox mode. Set a live GEMINI_API_KEY in your backend .env file to enable dynamic interactive counseling.)*"
        )
        
    elif any(k in query_lower for k in ["security", "cybersecurity", "encryption", "xss", "csrf", "sqli"]):
        return (
            "### 🛡️ Cybersecurity Engineer Placement Roadmap (3-Month Plan)\n\n"
            "Here is a targeted Security Engineering preparation guide:\n\n"
            "#### **Month 1: Cryptography & Network Security**\n"
            "- **Crypto:** Symmetric vs asymmetric encryption, hashing algorithms (SHA-256), digital signatures, and certificates.\n"
            "- **Networks:** OSI model, TCP/IP handshake, DNSSEC, VPNs, firewalls, and TLS/SSL handshake protocol details.\n"
            "- **Interview Questions:** Describe the step-by-step handshake procedure of TLS 1.3.\n\n"
            "#### **Month 2: Application Security & OWASP Top 10**\n"
            "- **OWASP:** SQL Injection (SQLi), Cross-Site Scripting (XSS), CSRF, Broken Authentication, and SSRF.\n"
            "- **Defenses:** Parameterized queries, Input Sanitization, Content Security Policy (CSP), and CORS configs.\n"
            "- **Interview Questions:** How do you defend against Cross-Site Request Forgery (CSRF) in modern APIs?\n\n"
            "#### **Month 3: Threat Modeling & Security Operations**\n"
            "- **Threat Modeling:** STRIDE methodology, security risk assessments, and vulnerability scanning.\n"
            "- **Operations:** IAM principles (Least Privilege), SOC processes, SIEM tools, and penetration testing methodologies.\n"
            "- **Mocks:** Walk through incident response scenarios and security audits for cloud deployments.\n\n"
            "*(Career Advisor is running in Sandbox mode. Set a live GEMINI_API_KEY in your backend .env file to enable dynamic interactive counseling.)*"
        )
        
    elif any(k in query_lower for k in ["mobile", "ios", "android", "swift", "kotlin", "react native", "flutter"]):
        return (
            "### 📱 Mobile Engineer Placement Roadmap (3-Month Plan)\n\n"
            "Here is a targeted iOS & Android development preparation guide:\n\n"
            "#### **Month 1: Language Mastery & UI Frameworks**\n"
            "- **Native:** Swift (iOS) or Kotlin (Android). Standard control flow, memory model (ARC vs JVM GC), and OOP.\n"
            "- **UI:** SwiftUI/UIKit (iOS) or Jetpack Compose/XML (Android) declarative layouts.\n"
            "- **Interview Questions:** What is ARC in Swift, and how do you resolve retain cycles/strong reference cycles?\n\n"
            "#### **Month 2: App Architecture & State Management**\n"
            "- **Architecture:** MVVM, VIPER, or Clean Architecture. Dependency injection and repository patterns.\n"
            "- **State:** Lifecycle hooks, reactive frameworks (Combine/Flow), and local database storage (Room/CoreData/SQLite).\n"
            "- **Network:** REST/GraphQL consumption, handling offline caching, image loading optimization.\n\n"
            "#### **Month 3: Performance, Testing & Publishing**\n"
            "- **Performance:** Threading (GCD/Coroutines), memory profiling, frame rate debugging, and bundle size reduction.\n"
            "- **Testing:** Unit tests, UI testing, and CI/CD pipelines for mobile apps (Fastlane).\n"
            "- **Mocks:** Design a real-time chat interface with offline-first support and explain network queueing.\n\n"
            "*(Career Advisor is running in Sandbox mode. Set a live GEMINI_API_KEY in your backend .env file to enable dynamic interactive counseling.)*"
        )
        
    else:
        return (
            "👋 **Hi! I am your CognitiveCoach AI Career Counselor.**\n\n"
            "I can help you build structured study roadmaps, review coding patterns, compare structures, and prepare for placements. Try asking me:\n\n"
            "- *'How do I reverse a binary tree?'* (New!)\n"
            "- *'Compare arrays vs linked lists'* (New!)\n"
            "- *'Explain sliding window pattern'* (New!)\n"
            "- *'Explain OOP pillars'* (New!)\n"
            "- *'Give me a Full Stack Web Developer study roadmap'*\n\n"
            "Type a query in the chat box to begin!"
        )

@router.post("/chat", response_model=ChatResponse)
def get_chat_response(req: ChatRequest, x_gemini_key: Optional[str] = Header(None)):
    if not req.messages:
        raise HTTPException(status_code=400, detail="Message history cannot be empty")
        
    last_user_message = next((m.content for m in reversed(req.messages) if m.role == "user"), None)
    if not last_user_message:
        raise HTTPException(status_code=400, detail="No user message found in history")
        
    active_key = x_gemini_key or GEMINI_API_KEY
    if not active_key:
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
            "Adhere to these rules strictly:\n"
            "- Be highly encouraging, structured, and detailed.\n"
            "- Use Markdown lists, bold headers, and code snippets where relevant.\n"
            "- If they ask for a roadmap, structure it week-by-week or phase-by-phase with clear topics and free resource links.\n"
            "- Provide accurate, industry-aligned guidance on standard web development, database scaling, SDE, product, and data systems.\n"
            "- Recommend standard coding patterns, proper complexities (like O(N) time or O(1) space), and robust database constraints."
        )
        
        # Format conversation history for Gemini
        gemini_contents = []
        for msg in req.messages:
            role_map = "user" if msg.role == "user" else "model"
            gemini_contents.append({
                "role": role_map,
                "parts": [{"text": msg.content}]
            })
            
        payload = {
            "contents": gemini_contents,
            "systemInstruction": {
                "parts": [
                    {"text": system_prompt}
                ]
            }
        }
        
        res = requests.post(generate_url, headers={"Content-Type": "application/json"}, json=payload, params={"key": active_key}, timeout=30)
        
        if res.status_code == 200:
            content = res.json()
            response_text = content["candidates"][0]["content"]["parts"][0]["text"]
            return {"response": response_text}
        else:
            raise Exception(f"Gemini API error: {res.text}")
            
    except Exception as e:
        logger.warning("Live Gemini chatbot failed: %s. Falling back to sandbox counselor.", e)
        response_text = generate_advisor_fallback(last_user_message)
        return {"response": response_text}
