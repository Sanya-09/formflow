from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import schemas
from app.models import models
from datetime import datetime, timezone

router = APIRouter(prefix="/api/public", tags=["public"])

@router.get("/forms/{slug}", response_model=schemas.Form)
def get_public_form(slug: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.public_slug == slug, models.Form.status == "published").first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found or not published")
    return form

@router.post("/forms/{slug}/responses", response_model=schemas.Response)
def submit_response(slug: str, response: schemas.ResponseCreate, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.public_slug == slug, models.Form.status == "published").first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    # Basic server-side validation can be added here (e.g. required fields check)
    new_response = models.Response(
        form_id=form.id,
        submitted_at=datetime.now(timezone.utc)
    )
    db.add(new_response)
    db.commit()
    db.refresh(new_response)

    for answer in response.answers:
        # verify question belongs to form
        question = db.query(models.Question).filter(models.Question.id == answer.question_id, models.Question.form_id == form.id).first()
        if question:
            new_answer = models.Answer(
                response_id=new_response.id,
                question_id=answer.question_id,
                value=answer.value
            )
            db.add(new_answer)
    
    db.commit()
    db.refresh(new_response)
    
    # Reload answers for the response to return fully populated object
    return new_response
