# PaddleOCR Service

A FastAPI-based OCR service using PaddleOCR for text extraction from images.

## Features

- **PaddleOCR** - High accuracy text recognition
- **FastAPI** - Fast, modern Python web framework
- **Docker support** - Easy deployment

## Local Setup

### Prerequisites

- Python 3.10+
- pip

### Installation

```bash
cd ocr-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Run Locally

```bash
python main.py
```

The service will be available at `http://localhost:5001`

## API Endpoints

### Health Check

```
GET /
GET /health
```

### OCR Extraction

```
POST /ocr
Content-Type: multipart/form-data

file: <image file>
```

**Response:**
```json
{
  "text": "Extracted text from image",
  "confidence": 0.95
}
```

## Docker Deployment

### Build

```bash
docker build -t ocr-service .
```

### Run

```bash
docker run -p 5001:5001 ocr-service
```

## Deployment Options

### Render

1. Create a new Web Service
2. Connect your GitHub repository
3. Set:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Deploy

### Railway

1. Create new project from GitHub
2. Railway will auto-detect Python
3. Set the start command in railway.json or dashboard

### Hugging Face Spaces

1. Create a new Space with Gradio/FastAPI SDK
2. Upload files or connect GitHub
3. The Space will auto-deploy

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5001 | Server port |

## Notes

- First request may be slow as PaddleOCR downloads model files
- Model files are cached after first use
- GPU acceleration is disabled for broader compatibility
