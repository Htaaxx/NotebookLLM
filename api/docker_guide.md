## Running Individual APIs Using Docker

If you want to run each API separately using a Dockerfile, follow these steps:

### 1. Build the Docker Image
```sh
docker build -t my-api .
```

### 2. Run the YouTube Transcript API
```sh
docker run -e API_MODULE="get_youtube_transcript_api" -p 8001:8000 my-api
```
Access it at: [http://localhost:8001](http://localhost:8001)

### 3. Run the Extract File Content API
```sh
docker run -e API_MODULE="extract_file_content_api" -p 8002:8000 my-api
```
Access it at: [http://localhost:8002](http://localhost:8002)