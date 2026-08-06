import base64
import io
import numpy as np
# pyrefly: ignore [missing-import]
from PIL import Image
import torch
from facenet_pytorch import MTCNN, InceptionResnetV1

# Set device to GPU if available, else CPU
device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')

# Initialize MTCNN and FaceNet model
# image_size=160 is standard for InceptionResnetV1
mtcnn = MTCNN(image_size=160, margin=14, device=device, selection_method='probability')
resnet = InceptionResnetV1(pretrained='vggface2', device=device).eval()

def decode_base64_image(base64_str: str) -> Image.Image:
    """Decodes a base64-encoded image string into a PIL Image."""
    try:
        if ',' in base64_str:
            base64_str = base64_str.split(',')[1]
        image_bytes = base64.b64decode(base64_str)
        image = Image.open(io.BytesIO(image_bytes))
        if image.mode != 'RGB':
            image = image.convert('RGB')
        return image
    except Exception as err:
        raise ValueError(f"Invalid image format or malformed base64 encoding: {str(err)}")

def generate_embedding_from_image(image: Image.Image) -> list:
    """Detects a face in the image, generates its 512-dim embedding, and returns it."""
    # 1. Run detection first to count faces and verify quality
    boxes, probs = mtcnn.detect(image)
    
    if boxes is None or len(boxes) == 0:
        raise ValueError("Face not detected")
    
    if len(boxes) > 1:
        raise ValueError("Multiple faces detected")
        
    prob = probs[0]
    if prob is None or prob < 0.90:
        raise ValueError("Poor image quality")

    # 2. Extract cropped & normalized face tensor [3, 160, 160] directly using pre-detected boxes (Single-pass MTCNN)
    face_tensor = mtcnn.extract(image, boxes, save_path=None)
    if face_tensor is None:
        raise ValueError("Face alignment extraction failed")

    # 3. Generate embedding vector [512]
    with torch.no_grad():
        face_tensor = face_tensor.to(device).unsqueeze(0)
        embedding_tensor = resnet(face_tensor)
        embedding = embedding_tensor.squeeze(0).cpu().tolist()
        
    return embedding

def calculate_cosine_similarity(emb1: list, emb2: list) -> float:
    """Calculates cosine similarity between two face embeddings."""
    a = np.array(emb1)
    b = np.array(emb2)
    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(dot_product / (norm_a * norm_b))
