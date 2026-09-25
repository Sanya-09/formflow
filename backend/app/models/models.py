from sqlalchemy import Column, String, Text, Boolean, Integer, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Creator(Base):
    __tablename__ = "creators"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    forms = relationship("Form", back_populates="creator")

class Form(Base):
    __tablename__ = "forms"

    id = Column(String, primary_key=True, default=generate_uuid)
    creator_id = Column(String, ForeignKey("creators.id"))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="draft") # draft, published
    public_slug = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    published_at = Column(DateTime, nullable=True)

    creator = relationship("Creator", back_populates="forms")
    questions = relationship("Question", back_populates="form", cascade="all, delete-orphan", order_by="Question.position")
    responses = relationship("Response", back_populates="form", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, default=generate_uuid)
    form_id = Column(String, ForeignKey("forms.id"))
    type = Column(String, nullable=False) # short_text, long_text, multiple_choice, dropdown, email, number, yes_no, rating
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    required = Column(Boolean, default=False)
    position = Column(Integer, default=0)
    settings = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    form = relationship("Form", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")

class Response(Base):
    __tablename__ = "responses"

    id = Column(String, primary_key=True, default=generate_uuid)
    form_id = Column(String, ForeignKey("forms.id"))
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    form = relationship("Form", back_populates="responses")
    answers = relationship("Answer", back_populates="response", cascade="all, delete-orphan")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(String, primary_key=True, default=generate_uuid)
    response_id = Column(String, ForeignKey("responses.id"))
    question_id = Column(String, ForeignKey("questions.id"))
    value = Column(String, nullable=True) # Storing as string for simplicity, or JSON

    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")
