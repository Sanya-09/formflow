# FormFlow API Documentation

This document outlines all the REST API endpoints available in the FormFlow backend.

Base URL (Local Development): `http://localhost:8000`

---

## 1. Forms (Creator APIs)

*Note: For the scope of this assignment, creator APIs are authenticated via a hardcoded `DEMO_CREATOR_ID` on the backend. In a production environment, these would require an `Authorization: Bearer <token>` header.*

### List Forms
- **Endpoint**: `GET /api/forms`
- **Description**: Returns all forms belonging to the authenticated creator.
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "form-id",
      "title": "Customer Feedback",
      "description": "Help us improve",
      "status": "published",
      "public_slug": "feedback-2024",
      "created_at": "2026-09-25T10:00:00Z",
      "responses_count": 12
    }
  ]
  ```

### Create Form
- **Endpoint**: `POST /api/forms`
- **Description**: Creates a new blank form.
- **Request Body**:
  ```json
  {
    "title": "New Form",
    "description": "Optional description"
  }
  ```
- **Response**: `200 OK` (Returns the created form object)

### Get Form Details
- **Endpoint**: `GET /api/forms/{form_id}`
- **Description**: Fetches a specific form along with all its associated questions ordered by position.
- **Response**: `200 OK` (Returns the form object including a `questions` array)

### Update Form
- **Endpoint**: `PATCH /api/forms/{form_id}`
- **Description**: Updates form metadata (title or description).
- **Request Body**:
  ```json
  {
    "title": "Updated Title",
    "description": "Updated Description"
  }
  ```
- **Response**: `200 OK` (Returns updated form)

### Delete Form
- **Endpoint**: `DELETE /api/forms/{form_id}`
- **Description**: Deletes a form and all associated questions, responses, and answers.
- **Response**: `200 OK` `{"message": "Form deleted successfully"}`

### Duplicate Form
- **Endpoint**: `POST /api/forms/{form_id}/duplicate`
- **Description**: Creates an exact copy of the form and its questions. Responses are NOT duplicated.
- **Response**: `200 OK` (Returns the new form object)

### Publish Form
- **Endpoint**: `POST /api/forms/{form_id}/publish`
- **Description**: Sets a form's status to `published` and generates a `public_slug` if one doesn't exist.
- **Response**: `200 OK` (Returns updated form with `public_slug`)

### Unpublish Form
- **Endpoint**: `POST /api/forms/{form_id}/unpublish`
- **Description**: Sets a form's status back to `draft`.
- **Response**: `200 OK` (Returns updated form)

---

## 2. Questions (Builder APIs)

### List Questions
- **Endpoint**: `GET /api/forms/{form_id}/questions`
- **Description**: Returns all questions for a specific form.
- **Response**: `200 OK` (Array of question objects)

### Create Question
- **Endpoint**: `POST /api/forms/{form_id}/questions`
- **Description**: Adds a new question to the form.
- **Request Body**:
  ```json
  {
    "type": "short_text",
    "title": "What is your name?",
    "description": "",
    "required": true,
    "position": 0,
    "settings": {}
  }
  ```
- **Response**: `200 OK` (Returns the created question)

### Update Question
- **Endpoint**: `PATCH /api/questions/{question_id}`
- **Description**: Updates question properties (title, type, required status, settings, etc).
- **Request Body**:
  ```json
  {
    "title": "Updated Question Text",
    "required": false,
    "settings": {
      "options": ["Option 1", "Option 2"]
    }
  }
  ```
- **Response**: `200 OK` (Returns updated question)

### Delete Question
- **Endpoint**: `DELETE /api/questions/{question_id}`
- **Description**: Deletes a specific question.
- **Response**: `200 OK` `{"message": "Question deleted successfully"}`

### Reorder Questions
- **Endpoint**: `POST /api/forms/{form_id}/reorder`
- **Description**: Bulk updates the `position` index of multiple questions (used for drag-and-drop).
- **Request Body**:
  ```json
  [
    { "id": "question-1-id", "position": 0 },
    { "id": "question-2-id", "position": 1 }
  ]
  ```
- **Response**: `200 OK` `{"message": "Reordered successfully"}`

---

## 3. Responses & Analytics (Creator APIs)

### Get All Responses
- **Endpoint**: `GET /api/forms/{form_id}/responses`
- **Description**: Returns all submissions for a specific form.
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "response-id",
      "form_id": "form-id",
      "submitted_at": "2026-09-25T10:05:00Z",
      "answers": [
        {
          "id": "answer-id",
          "question_id": "question-id",
          "value": "Jane Doe"
        }
      ]
    }
  ]
  ```

### Get Single Response
- **Endpoint**: `GET /api/responses/{response_id}`
- **Description**: Retrieves detailed answer data for a single specific submission.
- **Response**: `200 OK` (Returns response object with populated answers)

### Get Form Statistics
- **Endpoint**: `GET /api/forms/{form_id}/stats`
- **Description**: Aggregates all responses into statistical metrics (counts, averages, min/max) for the Overview dashboard.
- **Response**: `200 OK`
  ```json
  {
    "question-id-1": {
      "type": "multiple_choice",
      "counts": { "Option A": 5, "Option B": 2 },
      "total": 7
    },
    "question-id-2": {
      "type": "rating",
      "average": 4.5,
      "min": 3,
      "max": 5,
      "total": 7
    }
  }
  ```

---

## 4. Public Respondent APIs

*These endpoints do not require authentication and are safely exposed to public users completing the forms.*

### Get Published Form
- **Endpoint**: `GET /api/public/forms/{slug}`
- **Description**: Retrieves a published form and its questions by its public slug. Fails if the form is in `draft` status.
- **Response**: `200 OK` (Returns the form object with questions)
- **Error**: `404 Not Found` (If invalid slug or unpublished)

### Submit Response
- **Endpoint**: `POST /api/public/forms/{slug}/responses`
- **Description**: Validates and submits a respondent's answers. Performs strict server-side validation against required fields, data types (email, numbers), and predefined choices. Fully transactional (commits all answers or none).
- **Request Body**:
  ```json
  {
    "answers": [
      { "question_id": "q1-id", "value": "Jane Doe" },
      { "question_id": "q2-id", "value": "jane@example.com" },
      { "question_id": "q3-id", "value": "5" }
    ]
  }
  ```
- **Response**: `200 OK` (Returns the created Response object)
- **Errors**: `400 Bad Request` (Returns descriptive errors like `"Invalid email format"` or `"Question is required"`)
