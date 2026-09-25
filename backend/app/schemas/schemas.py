from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class QuestionBase(BaseModel):
    type: str
    title: str
    description: Optional[str] = None
    required: bool = False
    position: int = 0
    settings: Dict[str, Any] = {}

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    required: Optional[bool] = None
    position: Optional[int] = None
    settings: Optional[Dict[str, Any]] = None

class Question(QuestionBase):
    id: str
    form_id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class FormBase(BaseModel):
    title: str
    description: Optional[str] = None

class FormCreate(FormBase):
    pass

class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class Form(FormBase):
    id: str
    creator_id: str
    status: str
    public_slug: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    questions: List[Question] = []
    model_config = ConfigDict(from_attributes=True)

class FormList(FormBase):
    id: str
    status: str
    public_slug: Optional[str]
    created_at: datetime
    updated_at: datetime
    responses_count: int = 0
    model_config = ConfigDict(from_attributes=True)

class AnswerCreate(BaseModel):
    question_id: str
    value: Optional[str] = None

class ResponseCreate(BaseModel):
    answers: List[AnswerCreate]

class Answer(BaseModel):
    id: str
    question_id: str
    value: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class Response(BaseModel):
    id: str
    form_id: str
    submitted_at: datetime
    answers: List[Answer]
    model_config = ConfigDict(from_attributes=True)

class Creator(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
