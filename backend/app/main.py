from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import forms

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FormFlow API")

# Configure CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forms.router)
from app.routers import public
app.include_router(public.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to FormFlow API"}
