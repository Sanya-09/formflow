import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
import random

from app.database import engine, Base, SessionLocal
from app.models import models

logger = logging.getLogger(__name__)

def seed_data():
    print("Initializing database...")
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Error creating tables: {type(e).__name__}: {str(e)}")
        raise

    db = SessionLocal()
    try:
        print("Checking for existing Demo Creator...")
        demo_creator = db.query(models.Creator).filter(models.Creator.id == "demo-creator-id").first()
        if not demo_creator:
            demo_creator = models.Creator(
                id="demo-creator-id",
                name="Demo Creator",
                email="demo@formflow.com"
            )
            db.add(demo_creator)
            db.commit()
            db.refresh(demo_creator)
            print("Demo Creator created.")
        else:
            print("Demo Creator already exists.")

        print("Cleaning up old demo forms...")
        old_forms = db.query(models.Form).filter(models.Form.creator_id == demo_creator.id).all()
        for f in old_forms:
            db.delete(f)
        db.commit()

        def add_question(form_id, type_, title, desc="", req=True, pos=0, settings=None):
            q = models.Question(
                form_id=form_id, type=type_, title=title, description=desc, 
                required=req, position=pos, settings=settings or {}
            )
            db.add(q)
            return q

        # 1. Customer Feedback
        print("Creating 'Customer Feedback' form...")
        f1 = models.Form(creator_id=demo_creator.id, title="Customer Feedback", description="Help us improve our service.", status="published", public_slug="feedback-2024")
        db.add(f1)
        db.commit()

        q1_1 = add_question(f1.id, "short_text", "What is your name?", "Optional but helpful", False, 0)
        q1_2 = add_question(f1.id, "rating", "How would you rate your recent experience?", "", True, 1, {"max": 5})
        q1_3 = add_question(f1.id, "multiple_choice", "What did you buy?", "", True, 2, {"options": ["Software", "Hardware", "Service"]})
        q1_4 = add_question(f1.id, "yes_no", "Would you recommend us to a friend?", "", True, 3)
        db.commit()

        # Add 12 responses to Customer Feedback
        for i in range(12):
            r = models.Response(form_id=f1.id, submitted_at=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 10)))
            db.add(r)
            db.flush()
            db.add(models.Answer(response_id=r.id, question_id=q1_1.id, value=f"Customer {i+1}"))
            db.add(models.Answer(response_id=r.id, question_id=q1_2.id, value=str(random.randint(3, 5))))
            db.add(models.Answer(response_id=r.id, question_id=q1_3.id, value=random.choice(["Software", "Hardware", "Service"])))
            db.add(models.Answer(response_id=r.id, question_id=q1_4.id, value=random.choice(["Yes", "Yes", "No"])))
        db.commit()

        # 2. Annual Tech Conference
        print("Creating 'Annual Tech Conference 2024' form...")
        f2 = models.Form(creator_id=demo_creator.id, title="Annual Tech Conference 2024", description="Register for the event.", status="published", public_slug="tech-conf")
        db.add(f2)
        db.commit()

        q2_1 = add_question(f2.id, "short_text", "Full Name", "", True, 0)
        q2_2 = add_question(f2.id, "email", "Email Address", "", True, 1)
        q2_3 = add_question(f2.id, "dropdown", "Ticket Type", "", True, 2, {"options": ["Early Bird", "Standard", "VIP"]})
        db.commit()

        # Add 8 responses to Tech Conference
        for i in range(8):
            r = models.Response(form_id=f2.id, submitted_at=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 5)))
            db.add(r)
            db.flush()
            db.add(models.Answer(response_id=r.id, question_id=q2_1.id, value=f"Attendee {i+1}"))
            db.add(models.Answer(response_id=r.id, question_id=q2_2.id, value=f"attendee{i+1}@example.com"))
            db.add(models.Answer(response_id=r.id, question_id=q2_3.id, value=random.choice(["Early Bird", "Standard", "VIP"])))
        db.commit()

        # 3. Untitled Form
        print("Creating 'Untitled Form'...")
        f3 = models.Form(creator_id=demo_creator.id, title="Untitled Form", status="draft")
        db.add(f3)
        db.commit()

        add_question(f3.id, "short_text", "New Question", "", False, 0)
        db.commit()

        print("Seed complete!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {type(e).__name__}: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
