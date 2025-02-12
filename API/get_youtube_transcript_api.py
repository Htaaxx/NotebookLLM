import re
import os
import requests
import yt_dlp
import torch
from fastapi import FastAPI, HTTPException
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
from pydantic import BaseModel
from urllib.parse import urlparse, parse_qs
from faster_whisper import WhisperModel

app = FastAPI()

class YouTubeLink(BaseModel):
    url: str

def extract_video_id(youtube_url: str) -> str:
    parsed_url = urlparse(youtube_url)
    if parsed_url.hostname in ["www.youtube.com", "youtube.com"]:
        return parse_qs(parsed_url.query).get("v", [None])[0]
    elif parsed_url.hostname in ["youtu.be"]:
        return parsed_url.path.lstrip("/")
    return None

def get_video_title(video_id: str) -> str:
    api_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        return response.json().get("title", "Unknown Title")
    except requests.exceptions.RequestException:
        return "Unknown Title"

def clean_transcript(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()

def fetch_transcript(video_id: str) -> str:
    try:
        transcript_data = YouTubeTranscriptApi.get_transcript(video_id)
    except NoTranscriptFound:
        try:
            transcript_data = YouTubeTranscriptApi.get_transcript(video_id, languages=["en"])
        except (NoTranscriptFound, TranscriptsDisabled):
            return None
    except TranscriptsDisabled:
        return None

    return clean_transcript(" ".join([entry["text"] for entry in transcript_data]))

def download_audio(video_url: str, output_path: str) -> str:
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': output_path
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([video_url])
    
    return output_path + ".mp3"

def transcribe_audio(audio_path: str) -> str:
    if torch.backends.mps.is_available():
        device = "mps"
    elif torch.cuda.is_available():
        device = "cuda"
    else:
        device = "cpu"
    
    compute_type = "float16" if device in ["cuda", "mps"] else "int8"
    print(f"Using device: {device}, compute type: {compute_type}")
    
    model = WhisperModel("base", device=device, compute_type=compute_type)
    
    segments, _ = model.transcribe(audio_path)
    transcript = " ".join([segment.text for segment in segments])
    
    return clean_transcript(transcript)

@app.post("/get_transcript/")
async def get_transcript(link: YouTubeLink):
    video_id = extract_video_id(link.url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    
    video_name = get_video_title(video_id)
    transcript_text = fetch_transcript(video_id)
    
    if transcript_text is None:
        audio_path = f"temp/{video_id}"
        try:
            os.makedirs("temp", exist_ok=True)
            audio_file = download_audio(link.url, audio_path)
            transcript_text = transcribe_audio(audio_file)
            os.remove(audio_file)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")
    
    return {"video_id": video_id, "video_name": video_name, "text": transcript_text}

# run API: uvicorn get_youtube_transcript_api:app --reload
