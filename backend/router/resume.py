import io
import re
import logging
import requests
import json
import zipfile
import xml.etree.ElementTree as ET
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Dict
from pydantic import BaseModel
from pypdf import PdfReader
from config import GEMINI_API_KEY, GEMINI_MODEL

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/resume", tags=["resume"])

# Pydantic Schemas
class CompatibilityScore(BaseModel):
    score: int
    feedback: str

class KeywordScore(BaseModel):
    score: int
    found: List[str]
    missing: List[str]

class ResumeAnalysisResponse(BaseModel):
    score: int
    hiring_chance: int
    verdict: str
    formatting_check: CompatibilityScore
    keyword_check: KeywordScore
    impact_check: CompatibilityScore
    suggestions: List[str]

# Define standard keyword profiles per SDE role
ROLE_KEYWORDS = {
    "Software Engineer": ["system design", "dsa", "scaling", "architecture", "database", "git", "python", "java", "c++", "data structures", "algorithms", "caching", "sql"],
    "AI Engineer": ["deep learning", "neural network", "transformer", "llm", "lora", "rag", "pytorch", "tensorflow", "nlp", "computer vision", "machine learning", "nlp", "tuning"],
    "Data Scientist": ["statistics", "a/b testing", "regression", "sql", "pandas", "numpy", "python", "machine learning", "feature engineering", "data pipeline", "tableau", "spark"],
    "Full Stack Web Developer": ["react", "node", "express", "fastapi", "rest api", "sql", "mongodb", "javascript", "typescript", "css", "html", "next.js", "frontend", "backend", "redux"],
    "IoT Engineer": ["mqtt", "firmware", "esp32", "rtos", "arm", "spi", "i2c", "embedded", "c", "microcontroller", "low power", "sensor", "hardware", "arduino"],
    "DevOps Engineer": ["kubernetes", "docker", "terraform", "ci/cd", "github actions", "aws", "cloud", "linux", "gitops", "prometheus", "grafana", "ansible", "jenkins"],
    "Cybersecurity Engineer": ["penetration testing", "threat modeling", "encryption", "tls", "ssl", "xss", "csrf", "sqli", "firewall", "owasp", "network security", "iam", "vulnerability"],
    "Mobile Engineer": ["swift", "kotlin", "react native", "flutter", "ios", "android", "xcode", "mobile architecture", "app store", "play store", "cocoapods", "gradle"]
}

def analyze_resume_locally(text: str, role: str, num_pages: int) -> dict:
    text_lower = text.lower()
    
    # 1. Formatting Check
    formatting_issues = []
    formatting_score = 100
    if num_pages > 1:
        formatting_score -= 20
        formatting_issues.append("Resume exceeds the recommended 1-page limit for standard technical applications.")
    
    # Check for core sections
    sections = ["experience", "projects", "education", "skills"]
    missing_sections = [s.upper() for s in sections if s not in text_lower]
    if missing_sections:
        formatting_score -= 10 * len(missing_sections)
        formatting_issues.append(f"Missing standard ATS section headers: {', '.join(missing_sections)}.")
        
    formatting_feedback = "Excellent formatting. Clean headers and page count."
    if formatting_issues:
        formatting_feedback = " ".join(formatting_issues)
    formatting_score = max(formatting_score, 30)

    # 2. Keyword Check
    keywords = ROLE_KEYWORDS.get(role, ROLE_KEYWORDS["Software Engineer"])
    found_keywords = []
    for kw in keywords:
        pattern = r'(?:^|[^a-zA-Z0-9_#+])' + re.escape(kw) + r'(?=$|[^a-zA-Z0-9_#+])'
        if re.search(pattern, text_lower):
            found_keywords.append(kw)
    missing_keywords = [kw for kw in keywords if kw not in found_keywords]
    
    keyword_score = max(round((len(found_keywords) / len(keywords)) * 100), 20)

    # 3. Impact & Quantitative Check
    # Look for metrics, numbers, percentages
    has_metrics = bool(re.search(r'\b\d+%|\$\d+|\b\d+x\b|\b\d+[\s-](users|servers|clients|percent)\b', text_lower))
    # Look for active action verbs
    action_verbs = ["designed", "implemented", "optimized", "reduced", "increased", "developed", "built", "managed", "created", "led", "architected"]
    found_verbs = [v for v in action_verbs if v in text_lower]
    
    impact_score = 100
    impact_feedback = []
    if not has_metrics:
        impact_score -= 30
        impact_feedback.append("Add quantifiable metrics (e.g. 'reduced latency by 35%', 'managed 500+ servers') to showcase business impact.")
    if len(found_verbs) < 3:
        impact_score -= 20
        impact_feedback.append("Use more strong, active technical action verbs (e.g. 'architected', 'optimized') at the start of your bullet points.")
        
    impact_feedback_str = "Strong impact descriptors with quantifiable achievements."
    if impact_feedback:
        impact_feedback_str = " ".join(impact_feedback)
    impact_score = max(impact_score, 30)

    # 4. Overall Score calculation
    overall_score = round((formatting_score + keyword_score + impact_score) / 3)
    
    # 5. Hiring Chance
    hiring_chance = min(max(round(overall_score * 1.12 - 5), 10), 98)
    
    # Verdict
    if overall_score >= 85:
        verdict = "Strong Match"
    elif overall_score >= 70:
        verdict = "Good Match"
    else:
        verdict = "Weak Match"

    # 6. Compile suggestions
    suggestions = []
    if num_pages > 1:
        suggestions.append("Condense your content to fit exactly 1 page by pruning older projects or shortening summaries.")
    if missing_sections:
        suggestions.append(f"Add clear section headings for: {', '.join(missing_sections)} in bold uppercase.")
    if len(missing_keywords) > 3:
        suggestions.append(f"Integrate core industry terms: {', '.join(missing_keywords[:4])} directly inside your skills or project descriptions.")
    if not has_metrics:
        suggestions.append("Rewrite project details using the XYZ formula: 'Accomplished [X], as measured by [Y], by doing [Z]'.")
    if len(found_verbs) < 4:
        suggestions.append("Replace passive descriptions like 'Responsible for maintaining' with active verbs like 'Maintained and deployed'.")
    if not suggestions:
        suggestions.append("Your resume looks ready! Optimize keyword densities specifically for each role application.")

    return {
        "score": overall_score,
        "hiring_chance": hiring_chance,
        "verdict": verdict,
        "formatting_check": {"score": formatting_score, "feedback": formatting_feedback},
        "keyword_check": {"score": keyword_score, "found": [kw.capitalize() for kw in found_keywords], "missing": [kw.capitalize() for kw in missing_keywords]},
        "impact_check": {"score": impact_score, "feedback": impact_feedback_str},
        "suggestions": suggestions
    }

@router.post("/check", response_model=ResumeAnalysisResponse)
def check_resume(
    file: UploadFile = File(...),
    role: str = Form("Software Engineer")
):
    # Validate file type extension
    file_ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if file_ext not in ["pdf", "txt", "docx"]:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, TXT or DOCX resumes.")
    
    # 1. Parse File Content
    resume_text = ""
    num_pages = 1
    
    try:
        if file_ext == "txt":
            content_bytes = file.file.read()
            resume_text = content_bytes.decode("utf-8", errors="ignore")
        elif file_ext == "pdf":
            reader = PdfReader(io.BytesIO(file.file.read()))
            num_pages = len(reader.pages)
            pages_text = []
            for p in reader.pages:
                text_extracted = p.extract_text()
                if text_extracted:
                    pages_text.append(text_extracted)
            resume_text = "\n".join(pages_text)
        elif file_ext == "docx":
            with zipfile.ZipFile(io.BytesIO(file.file.read())) as docx:
                xml_content = docx.read('word/document.xml')
                root = ET.fromstring(xml_content)
                namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
                text_elements = root.findall('.//w:t', namespaces)
                resume_text = " ".join([elem.text for elem in text_elements if elem.text])
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume document: {str(e)}")
        
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="The uploaded document appears to be empty or lacks extractable text.")

    # The Gemini key is sourced exclusively from the server environment
    # (GEMINI_API_KEY). Clients cannot supply or override it.
    active_key = GEMINI_API_KEY
    if not active_key:
        return analyze_resume_locally(resume_text, role, num_pages)
        
    try:
        model = GEMINI_MODEL
        generate_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        
        system_prompt = (
            "You are a professional ATS (Applicant Tracking System) scanner, senior technical recruiter, and resume auditor.\n"
            f"Your job is to analyze the provided resume text for the role of an '{role}' and compile an ATS scorecard.\n"
            "You MUST output ONLY a valid JSON object matching this exact structure, with no markdown code blocks, backticks, or prefix explanations:\n"
            "{\n"
            "  \"score\": 82,\n"
            "  \"hiring_chance\": 85,\n"
            "  \"verdict\": \"Strong Match\",\n"
            "  \"formatting_check\": {\"score\": 90, \"feedback\": \"Feedback about page count, layout, and sections.\"},\n"
            "  \"keyword_check\": {\"score\": 75, \"found\": [\"React\", \"Python\"], \"missing\": [\"Docker\", \"Redis\"]},\n"
            "  \"impact_check\": {\"score\": 80, \"feedback\": \"Feedback about metric inclusion, active action verbs, and impact phrasing.\"},\n"
            "  \"suggestions\": [\n"
            "    \"Suggestion 1 to optimize the resume layout or content.\",\n"
            "    \"Suggestion 2 to improve keyword densities.\"\n"
            "  ]\n"
            "}\n"
            "Review formatting: check if content feels clean, check sections. Check keywords matching the target role. Check impact verbs and quantitative numbers. Be strict and construct constructive, actionable suggestions."
        )
        
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"Resume Text to Analyze:\n\n{resume_text[:8000]}"}]
                }
            ],
            "systemInstruction": {
                "parts": [{"text": system_prompt}]
            },
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }
        
        res = requests.post(generate_url, headers={"Content-Type": "application/json"}, json=payload, params={"key": active_key}, timeout=15)
        
        if res.status_code == 200:
            content = res.json()
            response_json_text = content["candidates"][0]["content"]["parts"][0]["text"]
            response_json_text = re.sub(r'^```json\s*|```$', '', response_json_text.strip(), flags=re.MULTILINE)
            parsed_data = json.loads(response_json_text)
            
            required_keys = ["score", "hiring_chance", "verdict", "formatting_check", "keyword_check", "impact_check", "suggestions"]
            if all(k in parsed_data for k in required_keys):
                return parsed_data
            else:
                raise Exception("Missing required fields in Gemini JSON response")
        else:
            raise Exception(f"Gemini API returned status code {res.status_code}: {res.text}")
            
    except Exception as e:
        logger.warning("Live Gemini ATS check failed: %s. Falling back to local scanner.", e)
        return analyze_resume_locally(resume_text, role, num_pages)
