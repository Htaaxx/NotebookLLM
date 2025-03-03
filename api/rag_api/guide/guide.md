# Run docker

```sh
docker-compose up -d
```

# Run the Fast API

```sh
uvicorn rag:app --host 0.0.0.0 --port 8000 --reload
```

# Curl Command For Calling API embed

```sh
curl -X 'POST' 'http://localhost:8000/embed' \
-H 'Content-Type: multipart/form-data' \
-F 'files=@document1.pdf' \
-F 'files=@document2.pdf'
```

## Expected respone

```sh
{
    "message": "Embeddings stored successfully",
    "keys": ["0", "1", "2", "3"]
}
```

# Curl Command for Calling API retrieve to test retrieval (For Testing Purpose)

```sh
curl -X 'GET' 'http://localhost:8000/retrieve?query=your_question&top_k=3'
```

## Expected respone

```sh
{
    "context": [
        "Relevant content snippet 1",
        "Relevant content snippet 2"
    ]
}
```

# Curl Command for Calling API for asking LLM to response

```sh
curl -X 'GET' 'http://localhost:8000/ask?query=Explain AI embeddings'
```

## Expected respone

```sh
{
    "response": "AI embeddings refer to..."
}
```
