from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Backend running"}


# ✅ ADDED: Color Matching AI
def get_color_match(tone):
    if tone == "dark":
        return "White Shirt + Navy Blue Jeans"
    else:
        return "Black Shirt + Grey Pants"


@app.post("/analyze/")
async def analyze_image(
    image: UploadFile = File(...),
    event: str = Form(...),
    gender: str = Form(...)
):
    # Read image
    img_bytes = await image.read()
    npimg = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    if img is None:
        return {"error": "Image error"}

    # Resize
    small = cv2.resize(img, (100, 100))
    pixels = small.reshape(-1, 3).astype(np.float32)

    # KMeans
    _, labels, centers = cv2.kmeans(
        pixels,
        3,
        None,
        (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0),
        10,
        cv2.KMEANS_RANDOM_CENTERS
    )

    dominant = centers[np.argmax(np.bincount(labels.flatten()))]

    # Tone
    tone = "dark" if np.mean(dominant) < 120 else "light"

    # Male outfits
    male = {
        "party": ["Black Suit", "Velvet Blazer", "Party Shirt"],
        "casual": ["T-shirt Jeans", "Hoodie Outfit", "Streetwear"],
        "formal": ["Formal Suit", "Blazer Outfit", "Office Wear"],
        "wedding": ["Sherwani", "Kurta Pajama", "Ethnic Wear"]
    }

    # Female outfits
    female = {
        "party": ["Black Dress", "Red Gown", "Party Wear"],
        "casual": ["Crop Top Jeans", "Oversized Hoodie", "Casual Wear"],
        "formal": ["Blazer Set", "Formal Outfit"],
        "wedding": ["Saree", "Lehenga", "Anarkali"]
    }

    # Select outfits
    if gender.lower() == "female":
        suggestions = female.get(event, ["Saree", "Lehenga"])
    else:
        suggestions = male.get(event, ["Black Suit", "T-shirt Jeans"])

    return {
        "event": event,
        "gender": gender,
        "tone": tone,
        "suggestions": suggestions,
        "match": get_color_match(tone)   # ✅ ADDED
    }