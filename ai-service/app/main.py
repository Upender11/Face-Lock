from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import numpy as np
from app.model import decode_base64_image, generate_embedding_from_image, calculate_cosine_similarity

app = FastAPI(title="Face Recognition AI Service")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173","https://face-lock-3og9.vercel.app","https://face-lock-amber.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schemas
class GenerateEmbeddingRequest(BaseModel):
    image: str = Field(..., description="Base64 encoded face image")

class GenerateEmbeddingResponse(BaseModel):
    embedding: List[float]

class Candidate(BaseModel):
    id: str
    embedding: List[float]

class VerifyFaceRequest(BaseModel):
    live_embedding: List[float]
    candidates: List[Candidate]
    threshold: Optional[float] = Field(default=0.70, description="Cosine similarity threshold")

class VerifyFaceResponse(BaseModel):
    match: bool
    matched_id: Optional[str] = None
    score: float

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-service"}

@app.post("/generate-embedding", response_model=GenerateEmbeddingResponse)
def generate_embedding(payload: GenerateEmbeddingRequest):
    try:
        # Decode image from base64
        pil_image = decode_base64_image(payload.image)
        # Generate face embedding
        embedding = generate_embedding_from_image(pil_image)
        return GenerateEmbeddingResponse(embedding=embedding)
    except ValueError as val_err:
        # Client input error (no face, multiple faces, bad quality)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(exc)}"
        )

@app.post("/verify-face", response_model=VerifyFaceResponse)
def verify_face(payload: VerifyFaceRequest):
    if not payload.candidates:
        return VerifyFaceResponse(match=False, score=0.0)

    # Convert candidate list and live embedding to NumPy arrays
    candidates_matrix = np.array([c.embedding for c in payload.candidates])  # Shape [N, 512]
    live_vector = np.array(payload.live_embedding)  # Shape [512]

    # Vectorized cosine similarity computation
    dot_products = np.dot(candidates_matrix, live_vector)  # Shape [N]
    candidates_norms = np.linalg.norm(candidates_matrix, axis=1)  # Shape [N]
    live_norm = np.linalg.norm(live_vector)  # Float

    # Guard against division by zero
    candidates_norms[candidates_norms == 0] = 1.0
    if live_norm == 0:
        live_norm = 1.0

    scores = dot_products / (candidates_norms * live_norm)

    # Fetch the candidate with the highest similarity score
    best_idx = np.argmax(scores)
    best_score = float(scores[best_idx])
    best_candidate_id = payload.candidates[best_idx].id

    threshold = payload.threshold if payload.threshold is not None else 0.70
    is_match = best_score >= threshold

    return VerifyFaceResponse(
        match=is_match,
        matched_id=best_candidate_id if is_match else None,
        score=best_score
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
