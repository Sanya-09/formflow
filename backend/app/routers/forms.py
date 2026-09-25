from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import schemas
from app.models import models
import uuid
from datetime import datetime, timezone
from sqlalchemy import func

router = APIRouter(prefix="/api/forms", tags=["forms"])

# Dummy creator ID for the assignment
DEMO_CREATOR_ID = "demo-creator-id"

@router.get("", response_model=List[schemas.FormList])
def get_forms(db: Session = Depends(get_db)):
    forms = db.query(models.Form).filter(models.Form.creator_id == DEMO_CREATOR_ID).all()
    
    result = []
    for form in forms:
        responses_count = db.query(models.Response).filter(models.Response.form_id == form.id).count()
        form_dict = form.__dict__.copy()
        form_dict["responses_count"] = responses_count
        result.append(form_dict)
    
    return result

@router.post("", response_model=schemas.Form)
def create_form(form: schemas.FormCreate, db: Session = Depends(get_db)):
    # Check if demo creator exists, if not, wait for seed or error out. Seed should handle it.
    new_form = models.Form(
        creator_id=DEMO_CREATOR_ID,
        title=form.title,
        description=form.description
    )
    db.add(new_form)
    db.commit()
    db.refresh(new_form)
    return new_form

@router.get("/{form_id}", response_model=schemas.Form)
def get_form(form_id: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id, models.Form.creator_id == DEMO_CREATOR_ID).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form

@router.patch("/{form_id}", response_model=schemas.Form)
def update_form(form_id: str, form_update: schemas.FormUpdate, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id, models.Form.creator_id == DEMO_CREATOR_ID).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    if form_update.title is not None:
        form.title = form_update.title
    if form_update.description is not None:
        form.description = form_update.description
        
    db.commit()
    db.refresh(form)
    return form

@router.delete("/{form_id}")
def delete_form(form_id: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id, models.Form.creator_id == DEMO_CREATOR_ID).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    db.delete(form)
    db.commit()
    return {"message": "Form deleted successfully"}

@router.post("/{form_id}/duplicate", response_model=schemas.Form)
def duplicate_form(form_id: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id, models.Form.creator_id == DEMO_CREATOR_ID).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
        
    new_form = models.Form(
        creator_id=DEMO_CREATOR_ID,
        title=f"{form.title} (Copy)",
        description=form.description
    )
    db.add(new_form)
    db.commit()
    db.refresh(new_form)
    
    for q in form.questions:
        new_q = models.Question(
            form_id=new_form.id,
            type=q.type,
            title=q.title,
            description=q.description,
            required=q.required,
            position=q.position,
            settings=q.settings
        )
        db.add(new_q)
    db.commit()
    db.refresh(new_form)
    return new_form

@router.post("/{form_id}/publish", response_model=schemas.Form)
def publish_form(form_id: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id, models.Form.creator_id == DEMO_CREATOR_ID).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
        
    form.status = "published"
    form.published_at = datetime.now(timezone.utc)
    if not form.public_slug:
        form.public_slug = str(uuid.uuid4())[:8] # Simple short slug
        
    db.commit()
    db.refresh(form)
    return form

@router.post("/{form_id}/unpublish", response_model=schemas.Form)
def unpublish_form(form_id: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id, models.Form.creator_id == DEMO_CREATOR_ID).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
        
    form.status = "draft"
    db.commit()
    db.refresh(form)
    return form

# Questions
@router.get("/{form_id}/questions", response_model=List[schemas.Question])
def get_questions(form_id: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id, models.Form.creator_id == DEMO_CREATOR_ID).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form.questions

@router.post("/{form_id}/questions", response_model=schemas.Question)
def create_question(form_id: str, question: schemas.QuestionCreate, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id, models.Form.creator_id == DEMO_CREATOR_ID).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
        
    new_question = models.Question(
        form_id=form_id,
        **question.model_dump()
    )
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    return new_question

@router.patch("/questions/{question_id}", response_model=schemas.Question)
def update_question(question_id: str, question_update: schemas.QuestionUpdate, db: Session = Depends(get_db)):
    question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    update_data = question_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(question, key, value)
        
    db.commit()
    db.refresh(question)
    return question

@router.delete("/questions/{question_id}")
def delete_question(question_id: str, db: Session = Depends(get_db)):
    question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(question)
    db.commit()
    return {"message": "Question deleted successfully"}

class ReorderItem(schemas.BaseModel):
    id: str
    position: int

@router.post("/{form_id}/reorder")
def reorder_questions(form_id: str, items: List[ReorderItem], db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id, models.Form.creator_id == DEMO_CREATOR_ID).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
        
    # Batch update positions
    for item in items:
        db.query(models.Question).filter(models.Question.id == item.id, models.Question.form_id == form_id).update({"position": item.position})
        
    db.commit()
    return {"message": "Reordered successfully"}

# Responses
@router.get("/{form_id}/responses", response_model=List[schemas.Response])
def get_responses(form_id: str, db: Session = Depends(get_db)):
    responses = db.query(models.Response).filter(models.Response.form_id == form_id).order_by(models.Response.submitted_at.desc()).all()
    return responses

@router.get("/responses/{response_id}", response_model=schemas.Response)
def get_response(response_id: str, db: Session = Depends(get_db)):
    response = db.query(models.Response).filter(models.Response.id == response_id).first()
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    return response

@router.get("/{form_id}/stats")
def get_form_stats(form_id: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
        
    stats = {}
    for question in form.questions:
        answers = db.query(models.Answer).filter(models.Answer.question_id == question.id).all()
        values = [a.value for a in answers if a.value is not None]
        
        if question.type in ["multiple_choice", "dropdown", "yes_no"]:
            counts = {}
            for v in values:
                counts[v] = counts.get(v, 0) + 1
            stats[question.id] = {"type": question.type, "counts": counts, "total": len(values)}
        elif question.type in ["rating", "number"]:
            try:
                num_values = [float(v) for v in values if v.strip()]
                stats[question.id] = {
                    "type": question.type,
                    "average": sum(num_values) / len(num_values) if num_values else 0,
                    "min": min(num_values) if num_values else 0,
                    "max": max(num_values) if num_values else 0,
                    "total": len(num_values)
                }
            except ValueError:
                stats[question.id] = {"type": question.type, "total": len(values)}
        else:
            stats[question.id] = {"type": question.type, "total": len(values)}
            
    return stats
