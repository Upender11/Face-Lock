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
    detect_result = mtcnn.detect(image)
    print("DEBUG: detect_result =", detect_result, "type =", type(detect_result))
    if isinstance(detect_result, tuple):
        print("DEBUG: len(detect_result) =", len(detect_result))
        for i, val in enumerate(detect_result):
            print(f"DEBUG: detect_result[{i}] type =", type(val), "value =", val)
            
    if detect_result is None or detect_result[0] is None:
        raise ValueError("Face not detected")
        
    boxes = detect_result[0]
    probs = detect_result[1]
    
    if len(boxes) > 1:
        raise ValueError("Multiple faces detected")

    # Handle list-like vs. single float structures for probs
    if isinstance(probs, (list, np.ndarray)) or hasattr(probs, '__getitem__'):
        prob = probs[0]
    else:
        prob = probs

    if prob is None or prob < 0.90:
        raise ValueError("Poor image quality")

    # 2. Extract cropped & normalized face tensor [3, 160, 160] directly using pre-detected boxes (Single-pass MTCNN)
    face_tensor = mtcnn.extract(image, boxes, save_path=None)
    if face_tensor is None:
        raise ValueError("Face alignment extraction failed")

    # 3. Generate embedding vector [512]
    with torch.no_grad():
        # Ensure we are handling a PyTorch tensor (type checker fallback)
        if isinstance(face_tensor, list):
            face_tensor = face_tensor[0]
            
        import typing
        face_tensor = typing.cast(torch.Tensor, face_tensor)
        
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
