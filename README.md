# FormFlow

A Typeform-inspired Form Builder and Responder Application. Built for a technical assignment.

## Overview

FormFlow allows creators to build conversational forms with drag-and-drop ordering, rich question types, and immediate live previews. Forms can be published and shared via a public URL, offering respondents a smooth, one-question-at-a-time experience. Responses are collected and summarized in a dashboard.

## Features

- **Creator Dashboard**: View forms, response counts, duplicate, and delete forms.
- **Form Builder**: Live editor with drag-and-drop reordering (`@dnd-kit`), question settings, and real-time updates.
- **Conversational UI**: Public forms are presented one question at a time with keyboard navigation.
- **8 Question Types**: Short Text, Long Text, Multiple Choice, Dropdown, Email, Number, Yes/No, and Rating.
- **Validation**: Email validation, number validation, and required field enforcement.
- **Response Analytics**: Basic stats summarizing choices and numeric averages, alongside individual response views.
- **Responsive & Accessible**: Works across devices with proper focus states and keyboard support.

## Tech Stack

### Frontend
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Interactions**: Framer Motion (animations), `@dnd-kit` (drag & drop)
- **Toast Notifications**: Sonner

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite
- **ORM**: SQLAlchemy
- **Data Validation**: Pydantic

## Architecture

The application is strictly separated into frontend and backend:
- The **Frontend** uses Next.js for routing and server/client-side rendering. The UI interacts with the backend strictly through a centralized API client (`lib/api.ts`).
- The **Backend** provides a REST API via FastAPI. It uses SQLAlchemy to interface with an SQLite database. Validation is handled by Pydantic schemas.

## Project Structure

```
formflow/
├── frontend/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # Reusable React components (builder, forms, UI)
│   ├── lib/                # API client configuration
│   ├── types/              # TypeScript interfaces
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI entrypoint
│   │   ├── database.py     # SQLAlchemy setup
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic validation schemas
│   │   ├── routers/        # API endpoints (forms, public)
│   │   └── seed.py         # Database seeding script
│   └── requirements.txt
│
└── README.md
```

## Database Schema

- **Creator**: `id`, `name`, `email`
- **Form**: `id`, `creator_id` (FK), `title`, `description`, `status` (draft/published), `public_slug`
- **Question**: `id`, `form_id` (FK), `type`, `title`, `description`, `required`, `position`, `settings` (JSON)
- **Response**: `id`, `form_id` (FK), `submitted_at`
- **Answer**: `id`, `response_id` (FK), `question_id` (FK), `value`

## API Documentation

For a comprehensive list of all API endpoints, request bodies, and response structures, please refer to the [API_DOCS.md](./API_DOCS.md) file included in the root of the project.

## Local Setup

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Database Seed (Important)
Initialize the database and populate it with demo forms and responses.
```bash
PYTHONPATH=. python app/seed.py
```

### 3. Run Backend
```bash
uvicorn app.main:app --reload --port 8000
```
API available at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

### 4. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend available at `http://localhost:3000`.

## Seed Data
Running `python app/seed.py` creates:
1. A default "Demo Creator".
2. Two forms: "Customer Feedback" and "Annual Tech Conference".
3. Pre-populated questions of varying types.
4. Dummy responses so the analytics dashboard works out of the box.

## Deployment
- **Frontend**: Recommended deployment on Vercel. Next.js App Router works perfectly there.
- **Backend**: Render or Railway. 
- **Database Limitation**: SQLite is used for this assignment. For a scalable production setup on serverless platforms, this should be migrated to PostgreSQL, as SQLite files do not persist well across ephemeral instances.

## Architecture Decisions
- SQLite was chosen per assignment instructions to keep the stack self-contained without needing Docker.
- A default `demo-creator-id` is heavily used in the backend in lieu of a complete JWT authentication flow, assuming the assignment's focus is on the builder/responder UX.

## Future Improvements
- **Authentication**: Implement JWT or OAuth for real user accounts.
- **Logic Jumps**: Allow questions to conditionally show based on previous answers.
- **Webhooks**: Send notifications on new form submissions.
- **File Uploads**: Integrate with AWS S3 for a file upload question type.
