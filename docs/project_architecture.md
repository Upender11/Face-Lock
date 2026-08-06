# Project Architecture

The system utilizes a 3-tier service architecture coupled with a MySQL database. It decouples core business logic, web presentations, and computationally intensive machine learning processes.

## System Topology

```
+------------------------------------+
|                                    |
|          React Frontend            |
|       (Vite / TypeScript)          |
|                                    |
+-----------------+------------------+
                  |
                  | HTTP/REST (JSON & Base64)
                  v
+-----------------+------------------+
|                                    |
|          Express Backend           |
|       (Node.js / TypeScript)       |
|                                    |
+--------+------------------+--------+
         |                  |
         | Prisma Client    | HTTP/REST
         v                  v
+--------+---------+  +-----+--------+
|                  |  |              |
|  MySQL Database  |  |  FastAPI AI  |
|                  |  |   (Python)   |
|                  |  |              |
+------------------+  +--------------+
```

---

## Tier Responsibilities

### 1. Presentation Tier (React Frontend)
- Manages the client-side single page app routing (React Router).
- Accesses user camera streaming feeds via browser standard `MediaDevices.getUserMedia` API.
- Captures snapshots, renders them onto canvas contexts, and serializes frames to Base64 JPEG buffers.
- Maintains user session tokens (JWT stored in `localStorage`) and switches UI styles between Light/Dark modes using CSS variables.

### 2. Application Logic Gateway Tier (Express Backend)
- Exposes REST routing rules for `/api/register`, `/api/login`, `/api/profile`, and `/api/logout`.
- Manages token signatures and session validations using JSON Web Tokens (JWT).
- Interacts with MySQL via Prisma ORM for User profiles and serialized FaceEmbedding arrays.
- Coordinates calls to the Python AI service.

### 3. Computation and Biometric Identification Tier (Python FastAPI AI Service)
- Runs a lightweight Uvicorn server wrapped around FastAPI.
- Employs **MTCNN** (Multi-task Cascaded Convolutional Networks) for facial feature localized bounding detection.
- Generates 512-dimensional vector face embeddings using a pre-trained **InceptionResnetV1** model (pretrained on VGGFace2).
- Executes 1:N vector similarity queries using Cosine Similarity thresholds.
