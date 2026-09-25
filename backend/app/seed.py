from app.database import SessionLocal, engine, Base
from app.models import models
import uuid

def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Create demo creator
    creator = db.query(models.Creator).filter(models.Creator.id == "demo-creator-id").first()
    if not creator:
        creator = models.Creator(
            id="demo-creator-id",
            name="Demo Creator",
            email="demo@example.com"
        )
        db.add(creator)
        db.commit()
        db.refresh(creator)

    # Check if forms exist
    existing_forms = db.query(models.Form).filter(models.Form.creator_id == creator.id).count()
    if existing_forms > 0:
        print("Data already seeded.")
        db.close()
        return

    # Create Customer Feedback form
    form1 = models.Form(
        creator_id=creator.id,
        title="Customer Feedback",
        description="We'd love to hear your thoughts on our recent service.",
        status="published",
        public_slug="feedback-2024"
    )
    db.add(form1)
    db.commit()
    db.refresh(form1)

    # Questions for Form 1
    q1 = models.Question(form_id=form1.id, type="rating", title="How would you rate your overall experience?", required=True, position=0, settings={"max": 5})
    q2 = models.Question(form_id=form1.id, type="multiple_choice", title="What did you like the most?", position=1, settings={"options": ["Speed", "Quality", "Customer Service", "Price"]})
    q3 = models.Question(form_id=form1.id, type="long_text", title="Any additional comments?", position=2)
    
    db.add_all([q1, q2, q3])
    db.commit()
    db.refresh(q1)
    db.refresh(q2)

    # Add responses for Form 1
    r1 = models.Response(form_id=form1.id)
    db.add(r1)
    db.commit()
    db.refresh(r1)
    db.add_all([
        models.Answer(response_id=r1.id, question_id=q1.id, value="5"),
        models.Answer(response_id=r1.id, question_id=q2.id, value="Customer Service"),
        models.Answer(response_id=r1.id, question_id=q3.id, value="Great job overall!")
    ])
    db.commit()

    r2 = models.Response(form_id=form1.id)
    db.add(r2)
    db.commit()
    db.refresh(r2)
    db.add_all([
        models.Answer(response_id=r2.id, question_id=q1.id, value="4"),
        models.Answer(response_id=r2.id, question_id=q2.id, value="Quality")
    ])
    db.commit()

    # Create Event Registration form
    form2 = models.Form(
        creator_id=creator.id,
        title="Annual Tech Conference 2024",
        description="Register for the upcoming tech conference.",
        status="published",
        public_slug="tech-conf-2024"
    )
    db.add(form2)
    db.commit()
    db.refresh(form2)

    f2q1 = models.Question(form_id=form2.id, type="short_text", title="What is your full name?", required=True, position=0)
    f2q2 = models.Question(form_id=form2.id, type="email", title="What is your email address?", required=True, position=1)
    f2q3 = models.Question(form_id=form2.id, type="dropdown", title="Which track are you most interested in?", required=True, position=2, settings={"options": ["Frontend", "Backend", "AI/ML", "DevOps"]})
    f2q4 = models.Question(form_id=form2.id, type="yes_no", title="Will you attend the after-party?", position=3)
    f2q5 = models.Question(form_id=form2.id, type="number", title="How many years of experience do you have?", position=4)
    
    db.add_all([f2q1, f2q2, f2q3, f2q4, f2q5])
    db.commit()
    db.refresh(f2q1)
    db.refresh(f2q2)
    db.refresh(f2q3)

    r3 = models.Response(form_id=form2.id)
    db.add(r3)
    db.commit()
    db.refresh(r3)
    db.add_all([
        models.Answer(response_id=r3.id, question_id=f2q1.id, value="Jane Doe"),
        models.Answer(response_id=r3.id, question_id=f2q2.id, value="jane@example.com"),
        models.Answer(response_id=r3.id, question_id=f2q3.id, value="Frontend"),
        models.Answer(response_id=r3.id, question_id=f2q4.id, value="Yes"),
        models.Answer(response_id=r3.id, question_id=f2q5.id, value="5")
    ])
    db.commit()

    print("Seed data created successfully.")
    db.close()

if __name__ == "__main__":
    seed_data()
