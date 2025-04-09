FROM --platform=linux/amd64 python:3.12

ENV PYTHONUNBUFFERED=1 

RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install pip==25.0.1 && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "./main.py"]
