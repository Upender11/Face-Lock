# API Documentation

## 1. Node.js Backend Gateway APIs (`PORT 5000`)

### Register Face Profile
- **Endpoint**: `POST /api/register`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "images": [
      "data:image/jpeg;base64,...",
      "data:image/jpeg;base64,...",
      "data:image/jpeg;base64,...",
      "data:image/jpeg;base64,...",
      "data:image/jpeg;base64,..."
    ]
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "message": "Registration successful",
    "user": {
      "id": "a9b8c7d6-e5f4-3210-abcd-ef0123456789",
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
  ```
- **Error States** (`400 Bad Request`):
  - Validation failed (missing fields, wrong formats, etc.).
  - Email already exists.
  - Image detection failure (e.g. `Registration failed at Capture #3: Face not detected`).

---

### Face Login (1:N Match)
- **Endpoint**: `POST /api/login`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "image": "data:image/jpeg;base64,..."
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "a9b8c7d6-e5f4-3210-abcd-ef0123456789",
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
  ```
- **Error States** (`401 Unauthorized` / `400 Bad Request`):
  - Face not detected or multiple faces in the feed.
  - Face not recognized (mismatch or similarity score below threshold `0.72`).

---

### User Profile
- **Endpoint**: `GET /api/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Response** (`200 OK`):
  ```json
  {
    "user": {
      "id": "a9b8c7d6-e5f4-3210-abcd-ef0123456789",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2026-07-31T06:00:00.000Z"
    }
  }
  ```
- **Error States** (`401 Unauthorized`):
  - Session expired, invalid, or missing token.

---

### Logout Session
- **Endpoint**: `POST /api/logout`
- **Authentication**: None
- **Response** (`200 OK`):
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

---

## 2. Python AI Service Microservices (`PORT 8000`)

### Generate Feature Embedding
- **Endpoint**: `POST /generate-embedding`
- **Request Body**:
  ```json
  {
    "image": "data:image/jpeg;base64,..."
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "embedding": [
      -0.03194, 0.05284, ..., -0.01258
    ]
  }
  ```
- **Error States** (`400 Bad Request`):
  - `Face not detected`
  - `Multiple faces detected`
  - `Poor image quality`

---

### Verify Match (1:N Matching)
- **Endpoint**: `POST /verify-face`
- **Request Body**:
  ```json
  {
    "live_embedding": [ -0.03194, 0.05284, ... ],
    "candidates": [
      {
        "id": "userId_1",
        "embedding": [ -0.03052, 0.04891, ... ]
      },
      {
        "id": "userId_2",
        "embedding": [ 0.01524, -0.08954, ... ]
      }
    ],
    "threshold": 0.72
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "match": true,
    "matched_id": "userId_1",
    "score": 0.8942
  }
  ```
