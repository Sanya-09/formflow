import os
import re
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

raw_url = os.getenv("DATABASE_URL")
if not raw_url or not raw_url.strip():
    DATABASE_URL = "sqlite:///./formflow.db"
else:
    DATABASE_URL = raw_url.strip()

# Normalize postgres:// to postgresql:// for SQLAlchemy compatibility
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = re.sub(r"^postgres://", "postgresql://", DATABASE_URL)

# Ensure psycopg2 driver is used when driver is not explicitly specified
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = re.sub(r"^postgresql://", "postgresql+psycopg2://", DATABASE_URL)

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
