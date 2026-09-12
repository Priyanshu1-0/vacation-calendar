from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.calendar import router as calendar_router

app = FastAPI(
    title="Vacation Calendar API",
    description="Public-holiday weeks with light/dark shading (weekday holidays only).",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(calendar_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
