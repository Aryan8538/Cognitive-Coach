import os
import logging
import requests
import random
from config import GEMINI_API_KEY, GEMINI_MODEL

logger = logging.getLogger(__name__)

# Dictionary of high-quality sample answers containing filler words, grammatical errors, and technical content for testing
SAMPLE_TRANSCRIPTS = {
    # System Design Question
    "design": [
        "So, like, to design a URL shortener, I think we first need, um, a web server that accepts a long URL, and then it, basically, hashes it. We can use, you know, MD5 or SHA-256. But, uh, that hash is too long, so we should take, like, the first 7 characters. For the database, we can use a key-value store, um, like Redis, for fast lookup. But for persistence, a relational database, like PostgreSQL, would be good. The bottleneck, I think, would be read requests, so caching is, basically, super important here."
    ],
    # Behavioral Question
    "conflict": [
        "Well, um, in my last group project, we had a disagreement on, you know, whether to use Node.js or Flask. One team member, like, wanted Flask, but I felt Node.js was better for WebSockets. So, basically, what I did was, I scheduled a meeting. I showed them a small prototype, and, um, we compared performance. Eventually, we agreed to, like, use Node.js, and, you know, it turned out really well because we finished on time."
    ],
    # General SDE Technical Question
    "default": [
        "So, basically, in order to solve this problem, I would, um, use a hash map. A hash map allows us to, like, store elements in O(1) time complexity. We iterate through the array, and, you know, check if the complement exists. If it does, we return the indices. Otherwise, we store the current number. It is, um, very efficient in terms of time, though it takes, basically, O(N) extra space."
    ]
}

def _select_mock_transcript(question_text: str) -> str:
    """Pick a canned transcript by inferring the question topic from its text."""
    question_text_lower = question_text.lower()
    if "design" in question_text_lower or "scale" in question_text_lower or "architecture" in question_text_lower:
        key = "design"
    elif "conflict" in question_text_lower or "team" in question_text_lower or "describe a time" in question_text_lower:
        key = "conflict"
    else:
        key = "default"
    return random.choice(SAMPLE_TRANSCRIPTS[key])


def transcribe_audio(audio_path: str, question_text: str = "") -> str:
    """
    Transcribes audio. If GEMINI_API_KEY is available, uploads to Gemini for transcription.
    Otherwise, returns a high-fidelity mock transcription based on the question topic.
    """
    if not GEMINI_API_KEY:
        return _select_mock_transcript(question_text)

    # If GEMINI_API_KEY is present, call Gemini's API to transcribe the audio file
    try:
        headers = {"X-Goog-Api-Key": GEMINI_API_KEY}
        
        # Determine mime type
        mime_type = "audio/webm"
        if audio_path.endswith(".wav"):
            mime_type = "audio/wav"
        elif audio_path.endswith(".mp3"):
            mime_type = "audio/mp3"

        # File API endpoint for upload metadata
        file_size = os.path.getsize(audio_path)
        upload_url = "https://generativelanguage.googleapis.com/upload/v1beta/files"
        
        # Start Resumable Upload
        headers_init = {
            **headers,
            "X-Upload-Content-Type": mime_type,
            "X-Upload-Content-Length": str(file_size),
            "Content-Type": "application/json"
        }
        
        payload_init = {
            "file": {
                "display_name": os.path.basename(audio_path)
            }
        }
        
        res_init = requests.post(upload_url, headers=headers_init, json=payload_init, params={"uploadType": "resumable"}, timeout=30)
        if res_init.status_code != 200:
            raise Exception(f"Failed to initiate upload: {res_init.text}")
            
        upload_location = res_init.headers.get("Location")
        if not upload_location:
            raise Exception("No upload location returned in headers.")
        
        # Perform actual upload
        with open(audio_path, "rb") as f:
            res_upload = requests.put(upload_location, data=f, timeout=120)
            
        if res_upload.status_code != 200:
            raise Exception(f"Failed to upload file content: {res_upload.text}")
            
        file_uri = res_upload.json().get("file", {}).get("uri")
        
        # 2. Call Gemini to transcribe
        model = GEMINI_MODEL
        generate_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        
        payload_generate = {
            "contents": [{
                "parts": [
                    {"file_data": {"mime_type": mime_type, "file_uri": file_uri}},
                    {"text": "Please transcribe the audio in this file. Provide only the exact transcript, retaining filler words like 'um', 'like', 'uh', 'so', and 'basically'. Do not include any summary or intro."}
                ]
            }]
        }
        
        res_generate = requests.post(generate_url, headers={"Content-Type": "application/json"}, json=payload_generate, params={"key": GEMINI_API_KEY}, timeout=60)
        
        # Clean up file from Gemini server (good practice)
        file_name = file_uri.split("/")[-1]
        delete_url = f"https://generativelanguage.googleapis.com/v1beta/files/{file_name}"
        requests.delete(delete_url, headers=headers, timeout=10)
        
        if res_generate.status_code == 200:
            content = res_generate.json()
            try:
                transcript_text = content["candidates"][0]["content"]["parts"][0]["text"].strip()
                return transcript_text
            except Exception:
                return "Failed to parse transcription from model output."
        else:
            raise Exception(f"Gemini API generation error: {res_generate.text}")
            
    except Exception as e:
        logger.warning("Live Gemini transcription failed: %s. Falling back to mock transcript.", e)
        return _select_mock_transcript(question_text)
