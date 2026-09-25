import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.models import models
from app.routers import forms, public

logger = logging.getLogger("uvicorn.error")

def init_db():
    """Initializes database tables and idempotently creates the default demo creator."""
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            demo_creator = db.query(models.Creator).filter(models.Creator.id == "demo-creator-id").first()
            if not demo_creator:
                demo_creator = models.Creator(
                    id="demo-creator-id",
                    name="Demo Creator",
                    email="demo@formflow.com"
                )
                db.add(demo_creator)
                db.commit()
                logger.info("Demo creator initialized.")
        except Exception as e:
            db.rollback()
            logger.error(f"Error checking/creating demo creator: {type(e).__name__}: {str(e)}")
            raise
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Database initialization failed: {type(e).__name__}: {str(e)}")
        raise

# Initialize database schema and required demo creator
init_db()

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
app.include_router(public.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to FormFlow API"}
