import re
import os
import requests
import openai
import io
import subprocess
from fastapi import FastAPI, HTTPException
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
from pydantic import BaseModel
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv  
import logging
import time
import random


dotenv_path = os.path.abspath("../rag_api/app/.env")
load_dotenv(dotenv_path)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

app = FastAPI()

class YouTubeLink(BaseModel):
    url: str

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("Missing OpenAI API Key. Set 'OPENAI_API_KEY' in environment variables.")

openai.api_key = OPENAI_API_KEY  

def extract_video_id(youtube_url: str) -> str:
    parsed_url = urlparse(youtube_url)
    if parsed_url.hostname and parsed_url.hostname.endswith("youtube.com"):
        return parse_qs(parsed_url.query).get("v", [""])[0]
    elif parsed_url.hostname and "youtu.be" in parsed_url.hostname:
        return parsed_url.path.lstrip("/")
    return ""

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
    attempt = 0
    while attempt < 3:
        try:
            logging.info(f"Fetching transcript for video ID: {video_id}")
            transcript_data = YouTubeTranscriptApi.get_transcript(video_id)
            return clean_transcript(" ".join([entry["text"] for entry in transcript_data]))
        
        except NoTranscriptFound:
            logging.warning(f"No transcript found for video ID {video_id}, trying other languages...")
            try:
                transcript_data = YouTubeTranscriptApi.get_transcript(video_id, languages=["en", "vi", "es", "fr", "de", "zh", "ja", "ko"])
                return clean_transcript(" ".join([entry["text"] for entry in transcript_data]))
            except NoTranscriptFound:
                logging.error(f"No transcript available for video ID: {video_id}")
                break

        except TranscriptsDisabled:
            logging.error(f"Transcripts are disabled for video ID: {video_id}")
            break

        except Exception as e:
            if "429" in str(e): 
                wait_time = (2 ** attempt) + random.uniform(1, 3)  # Exponential Backoff
                logging.warning(f"Rate limit hit! Waiting {wait_time:.2f} seconds before retrying...")
                time.sleep(wait_time)
                attempt += 1
            else:
                logging.critical(f"Unexpected error while fetching transcript for {video_id}: {str(e)}")
                break 

    return ""

def download_audio_in_memory(video_url: str) -> bytes:
    cmd = [
        "yt-dlp", "-f", "bestaudio", "--extract-audio", "--audio-format", "mp3",
        "--output", "-", video_url
    ]
    try:
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if result.returncode == 0:
            return convert_to_mp3(result.stdout)
        else:
            logging.error(f"yt-dlp failed: {result.stderr.decode()}")
            return b""
    except Exception as e:
        logging.error(f"Error downloading audio: {str(e)}")
        return b""

def convert_to_mp3(audio_data: bytes) -> bytes:
    try:
        process = subprocess.run(
            ["ffmpeg", "-i", "pipe:0", "-f", "mp3", "pipe:1"],
            input=audio_data,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        if process.returncode == 0:
            return process.stdout
        else:
            logging.error(f"FFmpeg conversion failed: {process.stderr.decode()}")
            return b""
    except Exception as e:
        logging.error(f"Error in audio conversion: {str(e)}")
        return b""

def transcribe_audio_with_openai(audio_data: bytes) -> str:
    audio_file = io.BytesIO(audio_data)
    audio_file.name = "audio.mp3"
    response = openai.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file
    )
    return clean_transcript(response.text)

@app.post("/get_transcript/")
async def get_transcript(link: YouTubeLink):
    video_id = extract_video_id(link.url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    video_name = get_video_title(video_id)
    transcript_text = fetch_transcript(video_id)

    if not transcript_text:
        logging.info("Transcript not found, extracting from audio...")
        try:
            audio_data = download_audio_in_memory(link.url)
            if not audio_data:
                raise Exception("Failed to download audio data")
            transcript_text = transcribe_audio_with_openai(audio_data)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")

    return {"video_id": video_id, "video_name": video_name, "text": transcript_text}

@app.get("/")
def read_root():
    return {"message": "File Extraction API is running"}
    