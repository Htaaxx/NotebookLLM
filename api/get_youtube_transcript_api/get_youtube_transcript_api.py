import re
import os
import requests
import yt_dlp
import openai
from fastapi import FastAPI, HTTPException
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
from pydantic import BaseModel
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv  
import logging

dotenv_path = os.path.abspath("../../API/.env")

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
    try:
        logging.info(f"Fetching transcript for video ID: {video_id}")
        transcript_data = YouTubeTranscriptApi.get_transcript(video_id)
        return clean_transcript(" ".join([entry["text"] for entry in transcript_data]))

    except NoTranscriptFound:
        logging.warning(f"No transcript found for video ID {video_id}, trying English transcript...")
        try:
            transcript_data = YouTubeTranscriptApi.get_transcript(video_id, languages=["en"])
            return clean_transcript(" ".join([entry["text"] for entry in transcript_data]))
        except NoTranscriptFound:
            logging.error(f"No English transcript available for video ID: {video_id}")
        except TranscriptsDisabled:
            logging.error(f"Transcripts are disabled for video ID: {video_id}")

    except TranscriptsDisabled:
        logging.error(f"Transcripts are disabled for video ID: {video_id}")

    except Exception as e:
        logging.critical(f"Unexpected error while fetching transcript for {video_id}: {str(e)}")

    return ""

def download_audio(video_url: str, output_path: str) -> str:
    ydl_opts = {
        "format": "bestaudio/best",
        "postprocessors": [{"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "192"}],
        "outtmpl": output_path,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([video_url])

    return output_path + ".mp3"

def transcribe_audio_with_openai(audio_path: str) -> str:
    with open(audio_path, "rb") as audio_file:
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
        audio_path = f"temp/{video_id}"
        os.makedirs("temp", exist_ok=True)

        try:
            audio_file = download_audio(link.url, audio_path)
            transcript_text = transcribe_audio_with_openai(audio_file)
            os.remove(audio_file)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")

    return {"video_id": video_id, "video_name": video_name, "text": transcript_text}

@app.get("/")
def read_root():
    return {"message": "File Extraction API is running"}
