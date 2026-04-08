"""
Desktop SQL IDE – FastAPI backend entry point.

Listens on localhost:8000 only; no external interfaces are exposed.
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.connections import router as connections_router
from routes.query import router as query_router
from routes.schema import router as schema_router

app = FastAPI(title="Desktop SQL IDE API", version="1.0.0")

# Allow requests only from the local Electron/Vite renderer
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "app://.", "file://"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(connections_router)
app.include_router(query_router)
app.include_router(schema_router)


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        log_level="info",
        reload=False,
    )
