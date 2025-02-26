# from create_mindmap.create_mindmap_api import get_smaller_branches
# from get_youtube_transcript_api.get_youtube_transcript_api import get_transcript
# from ocr_image_api.ocr_image_api import ocr
# from extract_file_content_api.extract_file_content_api import extract_text
from fastapi import FastAPI, File, UploadFile
# from get_youtube_transcript_api.get_youtube_transcript_api import YouTubeLink
import uvicorn

# init fastAPI
app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Welcome to the API"}

# @app.post("/get_smaller_branches")
# async def get_smaller_branches_api(doc: str):
#     return get_smaller_branches(doc)

# @app.post("/get_transcript")
# async def get_transcript_api(link: YouTubeLink):
#     return get_transcript(link)

# @app.post("/ocr")
# async def ocr_api(file: UploadFile = File(...)):
#     return ocr(file)

# @app.post("/extract_text")
# async def extract_text_api(file: UploadFile = File(...)):
#     return extract_text(file)

# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)