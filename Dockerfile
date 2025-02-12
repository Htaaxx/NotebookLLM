FROM python:3.9-slim

ENV PYTHONUNBUFFERED=1 

RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY API/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "uvicorn api.${API_MODULE}.main:app --host 0.0.0.0 --port 8000 --workers 4"]
