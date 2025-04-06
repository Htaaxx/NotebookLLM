from fastapi import FastAPI
from app.routers import embed, query

app = FastAPI(title="RAG FastAPI Service")

app.include_router(embed.router, prefix="/embed", tags=["Embedding"])
app.include_router(query.router, prefix="/query", tags=["Query"])
