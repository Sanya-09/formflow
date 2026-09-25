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

    # Load questions into a dictionary for quick lookup
    questions = {q.id: q for q in form.questions}
    
    # Map provided answers
    provided_answers = {a.question_id: a.value for a in response.answers}
    
    # Validation loop
    for q_id, question in questions.items():
        val = provided_answers.get(q_id)
        
        # Check required
        if question.required and (val is None or str(val).strip() == ""):
            raise HTTPException(status_code=400, detail=f"Question '{question.title}' is required.")
            
        if val is not None and str(val).strip() != "":
            # Validate Email
            if question.type == "email":
                if "@" not in str(val) or "." not in str(val):
                    raise HTTPException(status_code=400, detail=f"Invalid email format for '{question.title}'.")
            
            # Validate Number
            elif question.type == "number":
                try:
                    float(val)
                except ValueError:
                    raise HTTPException(status_code=400, detail=f"Numeric value required for '{question.title}'.")
            
            # Validate Rating
            elif question.type == "rating":
                try:
                    rating_val = int(val)
                    max_rating = int(question.settings.get("max", 5)) if isinstance(question.settings, dict) else 5
                    if rating_val < 1 or rating_val > max_rating:
                        raise HTTPException(status_code=400, detail=f"Rating must be between 1 and {max_rating} for '{question.title}'.")
                except ValueError:
                    raise HTTPException(status_code=400, detail=f"Integer rating required for '{question.title}'.")
            
            # Validate Multiple Choice / Dropdown
            elif question.type in ["multiple_choice", "dropdown"]:
                options = question.settings.get("options", []) if isinstance(question.settings, dict) else []
                if val not in options:
                    raise HTTPException(status_code=400, detail=f"Invalid option selected for '{question.title}'.")
            
            # Validate Yes/No
            elif question.type == "yes_no":
                if val not in ["Yes", "No"]:
                    raise HTTPException(status_code=400, detail=f"Answer must be 'Yes' or 'No' for '{question.title}'.")

    # If all validation passes, create response transaction
    new_response = models.Response(
        form_id=form.id,
        submitted_at=datetime.now(timezone.utc)
    )
    db.add(new_response)
    db.flush() # Flush to get response id without committing

    for answer in response.answers:
        if answer.question_id in questions:
            new_answer = models.Answer(
                response_id=new_response.id,
                question_id=answer.question_id,
                value=answer.value
            )
            db.add(new_answer)
    
    try:
        db.commit()
        db.refresh(new_response)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database transaction failed")
    
    return new_response
