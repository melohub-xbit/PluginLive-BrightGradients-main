from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.init_db import Database
from routes.auth import router as auth_router

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:5173",  # Vite default
    # "https://your-frontend-domain.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await Database.connect_db()

@app.on_event("shutdown")
async def shutdown_db_client():
    await Database.close_db()

app.include_router(auth_router, tags=["authentication"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}
