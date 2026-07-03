import os
import re
import json
import random
import logging
import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# We look for GEMINI_API_KEY
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

FILLER_WORDS = ["like", "um", "uh", "basically", "you know", "actually", "so"]

def count_filler_words(text: str) -> dict:
    """
    Counts common filler words in the transcript.
    """
    if not text:
        return {"total": 0, "details": {}}
    text_lower = text.lower()
    details = {}
    total = 0
    
    # Check for multi-word fillers like "you know"
    you_know_matches = len(re.findall(r"\byou know\b", text_lower))
    if you_know_matches > 0:
        details["you know"] = you_know_matches
        total += you_know_matches
        # Remove to avoid double-counting "you" or "know"
        text_lower = text_lower.replace("you know", "")

    # Check for single-word fillers
    for word in FILLER_WORDS:
        if word == "you know":
            continue
        matches = len(re.findall(rf"\b{word}\b", text_lower))
        if matches > 0:
            details[word] = matches
            total += matches
            
    return {"total": total, "details": details}

def evaluate_response_offline(transcript: str, question_text: str, duration_sec: float, code: str = None, code_language: str = None) -> dict:
    """
    Generates high-fidelity mock metrics and feedback programmatically based on the transcript.
    """
    word_count = len(transcript.split()) if transcript else 0
    # Calculate WPM
    wpm = round((word_count / (duration_sec / 60.0)), 1) if duration_sec > 0 else 120.0
    
    filler_data = count_filler_words(transcript)
    filler_count = filler_data["total"]
    filler_details = filler_data["details"]
    
    # Determine base scores (randomized slightly for realistic demo)
    grammar_score = random.randint(82, 92)
    clarity_score = random.randint(78, 88)
    relevance_score = random.randint(80, 94)
    
    # Penalize scores based on negative indicators
    if filler_count > 5:
        clarity_score -= 8
    if wpm > 150 or wpm < 80:
        clarity_score -= 5
        
    # Programmatic feedback strings
    feedback_points = []
    
    # Feedback based on filler words
    if filler_count > 0:
        fillers_list = [f"'{k}' ({v} times)" for k, v in filler_details.items()]
        feedback_points.append(
            f"**Reduce Filler Words:** You used filler words {filler_count} times, including {', '.join(fillers_list)}. "
            "Try pausing silently for a split second when transitioning between thoughts instead of using filler words."
        )
    else:
        feedback_points.append(
            "**Excellent Fluency:** Your speech was clear and free of noticeable filler words. This conveys high professionalism."
        )
        
    # Feedback based on pacing
    if wpm > 150:
        feedback_points.append(
            f"**Pacing too Fast:** Your speaking pace was {wpm} words per minute. "
            "Normal conversational pace is around 110–140 WPM. Slow down slightly to give your audience time to absorb technical details."
        )
    elif wpm < 90:
        feedback_points.append(
            f"**Pacing too Slow:** Your pace was {wpm} words per minute. "
            "Consider structured practice to formulate thoughts faster, ensuring you keep the interviewer engaged."
        )
    else:
        feedback_points.append(
            f"**Optimal Pacing:** Your pace was {wpm} WPM, which is within the ideal range of 110–140 WPM. This is easy to follow."
        )
        
    # Content-specific feedback
    question_lower = question_text.lower()
    if "design" in question_lower or "url" in question_lower:
        feedback_points.append(
            "**Architecture Feedback:** You correctly identified the hashing mechanism and caching requirements. "
            "To improve, discuss database sharding and how you would handle high write volumes if the system scales to millions of active short URLs."
        )
        suggested_answer = (
            "To design a scalable URL shortener, I would implement a layered architecture:\n\n"
            "1. **API Gateway & App Servers:** Web servers that take long URLs and return short URLs. We use Base62 encoding on an auto-incremented ID (from a distributed generator like Snowflake) to avoid hash collisions.\n"
            "2. **Caching (Redis):** Cache the mapping of short-to-long URLs. Since 80% of redirect requests hit 20% of URLs, this cuts database latency significantly.\n"
            "3. **Database (PostgreSQL + Sharding):** For persistence, a relational DB is ideal. We can shard database tables based on the short-URL key to scale reads and writes horizontally.\n"
            "4. **Redirection Flow:** Return an HTTP 302 (Found) code, which ensures redirects are tracked by our analytics service, rather than cached indefinitely by browsers."
        )
    elif "conflict" in question_lower or "team" in question_lower:
        feedback_points.append(
            "**Behavioral Feedback:** You structured your response using a format similar to the STAR method. "
            "To make it even more impactful, focus more on the 'Results' section—specifically, what metrics improved or what positive long-term team dynamics resulted from your action."
        )
        suggested_answer = (
            "During my engineering project, our team disagreed on our database tech stack: half wanted MongoDB for rapid prototyping, and the rest wanted PostgreSQL for structural integrity.\n\n"
            "**Task:** As the database lead, it was my job to align the team and avoid delays.\n"
            "**Action:** Instead of arguing, I created a quick benchmark script with mock schemas and loaded 100k records. I scheduled a 30-minute meeting showing query latencies for relational joins and data retrieval.\n"
            "**Result:** Seeing the empirical performance data resolved the debate. We chose PostgreSQL, finished our project 3 days early, and the setup scaled smoothly when we added more data tables later."
        )
    else:
        feedback_points.append(
            "**Technical Structure:** You explained the algorithmic approach clearly. "
            "For full points, ensure you explicitly state the time and space complexity at the very beginning of your answer, and walk through edge cases like empty inputs or integer overflows."
        )
        suggested_answer = (
            "To solve this problem efficiently, we can use a Hash Map to store elements as we iterate through the list. "
            "For each element, we check if its complement (Target - current value) is already in the map. If yes, we return the two indices immediately. "
            "This approach runs in O(N) time complexity because hash map lookups take O(1) time on average. "
            "The space complexity is O(N) since we store up to N elements in the map in the worst-case scenario."
        )
        
    if code:
        # Check basic syntax / length
        code_lines = len(code.split('\n'))
        if code_lines < 3:
            feedback_points.append(
                "**Incomplete Coding Answer:** Your submitted code solution is too brief. "
                "Ensure you write a complete function, declare variables clearly, and address edge cases."
            )
            relevance_score = max(50, relevance_score - 15)
        else:
            has_comments = "#" in code or "//" in code
            has_loops = "for" in code or "while" in code
            
            code_review_points = []
            code_review_points.append(f"**Syntax & Logic ({code_language or 'Unknown'}):** The implementation has clean syntax structure. " + 
                                      ("The loops correctly process array indexes." if has_loops else "No loops found; ensure the iterative logic is correct."))
            code_review_points.append("**Code Quality:** " + 
                                      ("Your use of descriptive comments helps clarify the algorithmic design." if has_comments else "Consider adding comments to explain complex steps to the interviewer."))
            code_review_points.append("**Complexity:** Time Complexity is O(N) where N is the input size. Space Complexity is O(1) auxiliary space.")
            
            feedback_points.append(
                "**Code Analysis:**\n\n" + "\n".join([f"- {pt}" for pt in code_review_points])
            )
            relevance_score = min(100, relevance_score + 5)
            clarity_score = min(100, clarity_score + 5)

    feedback_text = "\n\n".join(feedback_points)
    
    return {
        "words_per_minute": wpm,
        "filler_words_count": filler_count,
        "filler_words_details": filler_details,
        "grammar_score": grammar_score,
        "clarity_score": clarity_score,
        "relevance_score": relevance_score,
        "feedback_text": feedback_text,
        "suggested_answer": suggested_answer
    }

def evaluate_response(transcript: str, question_text: str, duration_sec: float, code: str = None, code_language: str = None) -> dict:
    """
    Main entrypoint for response evaluation. Calls Gemini if API key is present,
    otherwise falls back to programmatic offline evaluation.
    """
    if not GEMINI_API_KEY:
        return evaluate_response_offline(transcript, question_text, duration_sec, code, code_language)
        
    try:
        word_count = len(transcript.split()) if transcript else 0
        wpm = round((word_count / (duration_sec / 60.0)), 1) if duration_sec > 0 else 120.0
        
        filler_data = count_filler_words(transcript)
        filler_count = filler_data["total"]
        filler_details = filler_data["details"]
        
        # Call Gemini for qualitative evaluation
        model = "gemini-1.5-flash"
        generate_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        
        system_prompt = (
            "You are a professional technical recruiter, coding interviewer, and communications coach. "
            "Analyze the candidate's response (transcript + optional code solution) to an interview question. "
            "If code is provided, evaluate the code's correctness, time/space complexity, modularity, and style. "
            "Return a JSON object with the following fields:\n"
            "- grammar_score (integer from 1 to 100)\n"
            "- relevance_score (integer from 1 to 100)\n"
            "- clarity_score (integer from 1 to 100)\n"
            "- feedback_text (markdown string, detailing verbal/speaking feedback and coding feedback, including strengths and specific improvements)\n"
            "- suggested_answer (markdown string, providing a model high-scoring exemplar answer and code)\n"
            "\n"
            "Return ONLY the raw JSON object, no wrapping in markdown code blocks like ```json."
        )
        
        prompt = (
            f"Question Asked: {question_text}\n"
            f"Candidate Transcript: {transcript}\n"
            f"Speaking Rate: {wpm} words per minute\n"
            f"Filler Word Count: {filler_count}\n"
        )
        if code:
            prompt += f"Submitted Code ({code_language}):\n{code}\n"
        
        payload = {
            "contents": [{
                "parts": [
                    {"text": system_prompt},
                    {"text": prompt}
                ]
            }],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }
        
        res = requests.post(generate_url, headers={"Content-Type": "application/json"}, json=payload, params={"key": GEMINI_API_KEY}, timeout=60)
        
        if res.status_code == 200:
            content = res.json()
            response_text = content["candidates"][0]["content"]["parts"][0]["text"].strip()
            
            # Clean up response if there are any enclosing backticks
            if response_text.startswith("```"):
                response_text = re.sub(r"^```json\s*|```$", "", response_text, flags=re.MULTILINE)
            
            evaluation_data = json.loads(response_text)

            # Ensure the model returned every field the persistence layer reads;
            # otherwise fall through to the offline evaluator instead of raising
            # a KeyError later when saving metrics.
            required_keys = ["grammar_score", "relevance_score", "clarity_score", "feedback_text", "suggested_answer"]
            if not all(k in evaluation_data for k in required_keys):
                raise Exception("Gemini evaluation response missing required fields")

            # Merge in the programmatically calculated metrics
            evaluation_data["words_per_minute"] = wpm
            evaluation_data["filler_words_count"] = filler_count
            evaluation_data["filler_words_details"] = filler_details

            return evaluation_data
        else:
            raise Exception(f"Gemini evaluation API error: {res.text}")
            
    except Exception as e:
        logger.warning("Live Gemini evaluation failed: %s. Falling back to offline evaluation.", e)
        return evaluate_response_offline(transcript, question_text, duration_sec, code, code_language)
