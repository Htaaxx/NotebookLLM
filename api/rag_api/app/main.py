from fastapi import FastAPI
from app.routers import embed, query, recall  # Thêm recall router

app = FastAPI(title="RAG FastAPI Service with Active Recall")

app.include_router(embed.router, prefix="/embed", tags=["Embedding"])
app.include_router(query.router, prefix="/query", tags=["Query"])
app.include_router(recall.router, prefix="/recall", tags=["Active Recall"])
