# OCR Service using PaddleOCR

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from paddleocr import PaddleOCR
import io
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="OCR Service",
    description="OCR service using PaddleOCR for text extraction from images",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize PaddleOCR (English language, disable GPU for compatibility)
# use_angle_cls=True enables text direction detection
# lang='en' for English
ocr = PaddleOCR(
    use_angle_cls=True,
    lang='en',
    use_gpu=False,
    show_log=False
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "service": "PaddleOCR Service"}

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy"}

@app.post("/ocr")
async def extract_text(file: UploadFile = File(...)):
    """
    Extract text from an uploaded image using PaddleOCR
    
    Returns:
        - text: Extracted text from the image
        - confidence: Average confidence score (0-1)
    """
    try:
        # Read the uploaded file
        contents = await file.read()
        
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        
        logger.info(f"Processing image: {file.filename}, size: {len(contents)} bytes")
        
        # Perform OCR
        result = ocr.ocr(io.BytesIO(contents), cls=True)
        
        if not result or not result[0]:
            logger.warning("No text detected in image")
            return {
                "text": "",
                "confidence": 0.0
            }
        
        # Extract text and confidence scores
        texts = []
        confidences = []
        
        for line in result[0]:
            if line and len(line) >= 2:
                text_info = line[1]
                if text_info and len(text_info) >= 2:
                    texts.append(text_info[0])
                    confidences.append(text_info[1])
        
        # Combine all text
        extracted_text = "\n".join(texts)
        
        # Calculate average confidence
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
        
        logger.info(f"OCR completed: {len(extracted_text)} chars, {avg_confidence:.2%} confidence")
        
        return {
            "text": extracted_text,
            "confidence": avg_confidence
        }
        
    except Exception as e:
        logger.error(f"OCR error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
