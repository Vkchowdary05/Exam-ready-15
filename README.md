# 📚 Exam Ready

**AI-Powered Exam Paper Repository for Engineering Students**

> A full-stack web application that helps engineering students discover, share, and analyze exam papers using OCR and AI technology.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-8-green?logo=mongodb)
![Express](https://img.shields.io/badge/Express-4.18-lightgrey?logo=express)
![Python](https://img.shields.io/badge/Python-3.10-yellow?logo=python)

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [How the Web App Works](#-how-the-web-app-works)
- [OCR Workflow](#-ocr-workflow)
- [Deployment Architecture](#-deployment-architecture)
- [Environment Variables](#-environment-variables)
- [Local Setup Instructions](#-local-setup-instructions)
- [Production Deployment](#-production-deployment)
- [API Overview](#-api-overview)
- [Screenshots](#-screenshots)
- [Future Enhancements](#-future-enhancements)
- [Limitations](#-limitations)
- [Conclusion](#-conclusion)

---

## 🎯 Problem Statement

Engineering students face significant challenges when preparing for exams:

1. **Scattered Resources** - Exam papers are spread across WhatsApp groups, Google Drive links, and personal collections
2. **Poor Organization** - Papers are often mislabeled or missing metadata (subject, semester, year)
3. **Duplicate Content** - Same papers shared multiple times without proper categorization
4. **No Topic Analysis** - Students cannot identify important/frequently asked topics
5. **Time-Consuming Search** - Finding relevant papers requires extensive searching

---

## 💡 Solution Overview

**Exam Ready** is an intelligent exam paper repository that:

- Provides a **centralized platform** for uploading and discovering exam papers
- Uses **OCR (Optical Character Recognition)** to automatically extract text from paper images
- Employs **AI-powered metadata extraction** to auto-fill paper details (college, subject, semester, etc.)
- Offers **topic frequency analysis** to identify important topics across papers
- Implements **gamification** (credits, badges, leaderboard) to encourage contributions
- Features **advanced search and filtering** for quick paper discovery

---

## ✨ Key Features

### 📤 Smart Paper Upload
- Upload exam paper images (JPG, PNG, WEBP)
- Automatic text extraction using PaddleOCR
- AI-powered auto-fill of metadata fields
- Review and edit before submission

### 🔍 Advanced Search & Discovery
- Multi-filter search (college, subject, semester, branch, exam type, year)
- Text-based search across all papers
- Sort by recent, popularity, or relevance

### 📊 Topic Frequency Analysis
- View most frequently asked topics per subject
- Filter by exam type (Semester/Midterm)
- Identify high-priority topics for exam preparation

### 🎮 Gamification System
- Earn **credits** for uploading papers
- Unlock **badges** for achievements
- Compete on **leaderboards** (global, college, subject)

### 👤 User Features
- Secure authentication (JWT-based)
- Personalized dashboard with stats
- Like and bookmark papers
- Profile customization

### 🛡️ Admin Panel
- Paper verification and moderation
- User management
- Flagged content review

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **React 18** | UI component library |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS 4** | Utility-first styling |
| **Zustand** | State management |
| **React Hook Form** | Form handling |
| **Framer Motion** | Animations |
| **Radix UI** | Accessible UI components |
| **Recharts** | Data visualization |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js 18+** | JavaScript runtime |
| **Express.js** | Web framework |
| **TypeScript** | Type-safe development |
| **MongoDB** | NoSQL database |
| **Mongoose** | ODM for MongoDB |
| **JWT** | Authentication tokens |
| **Bcrypt.js** | Password hashing |
| **Multer** | File upload handling |
| **Cloudinary** | Cloud image storage |
| **Winston** | Logging |
| **Zod** | Schema validation |

### OCR Service
| Technology | Purpose |
|------------|---------|
| **Python 3.10** | Programming language |
| **FastAPI** | Web framework |
| **PaddleOCR** | Text extraction from images |
| **Uvicorn** | ASGI server |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting |
| **Render / Railway** | Backend & OCR service hosting |
| **MongoDB Atlas** | Cloud database |
| **Cloudinary** | Image CDN & storage |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│                         (Vercel - Next.js)                              │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────────────────┐ │
│  │  Login/   │  │ Dashboard │  │  Upload   │  │  Search & Discovery   │ │
│  │ Register  │  │  & Stats  │  │  Papers   │  │  Papers & Topics      │ │
│  └───────────┘  └───────────┘  └───────────┘  └───────────────────────┘ │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTPS (REST API)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                     │
│                      (Render/Railway - Node.js)                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │    Auth    │  │   Papers   │  │   Topics   │  │  Users & Gamify    │ │
│  │ Controller │  │ Controller │  │ Controller │  │    Controller      │ │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘  └─────────┬──────────┘ │
│         │               │               │                   │           │
│  ┌──────▼───────────────▼───────────────▼───────────────────▼─────────┐ │
│  │                     MongoDB (Atlas)                                 │ │
│  │   Users │ Papers │ Topics │ Notifications                          │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTP (Internal)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            OCR SERVICE                                   │
│                    (Render/Railway - Python)                            │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                        PaddleOCR                                   │  │
│  │          Text Extraction from Exam Paper Images                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 How the Web App Works

### User Flow

```mermaid
graph TD
    A[User Visits App] --> B{Logged In?}
    B -->|No| C[Login/Register]
    C --> D[Dashboard]
    B -->|Yes| D
    
    D --> E[Search Papers]
    D --> F[Upload Paper]
    D --> G[View Topics]
    D --> H[Leaderboard]
    D --> I[Profile]
    
    E --> J[Filter & Browse]
    J --> K[View Paper Details]
    K --> L[Like/Bookmark]
    
    F --> M[Upload Image]
    M --> N[OCR Processing]
    N --> O[AI Auto-Fill]
    O --> P[Review & Submit]
    P --> Q[Earn Credits]
```

### Step-by-Step User Journey

1. **Registration/Login**
   - User creates account with email, password, college, branch, semester
   - JWT token issued for authenticated sessions

2. **Dashboard**
   - View personal stats (uploads, likes received, credits, badges)
   - Quick access to recent papers and platform statistics

3. **Paper Upload**
   - Select exam paper image (JPG, PNG, WEBP)
   - OCR extracts text from image
   - AI suggests metadata (college, subject, semester, etc.)
   - User reviews and confirms details
   - Paper saved to database, user earns credits

4. **Search & Discovery**
   - Apply filters (college, subject, semester, branch, exam type, year)
   - Browse papers with sorting options
   - View paper details, questions, and topics
   - Like and bookmark papers for later

5. **Topic Analysis**
   - Select subject and exam type
   - View topic frequency chart
   - Identify high-priority topics for revision

6. **Gamification**
   - Earn credits for uploading papers
   - Unlock badges for achievements
   - Compete on leaderboards

---

## 🔍 OCR Workflow

The OCR pipeline processes uploaded exam paper images:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  User Uploads   │────▶│  Node.js API    │────▶│  Python OCR     │
│  Paper Image    │     │  Receives File  │     │  Service        │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  User Reviews   │◀────│  AI Extracts    │◀────│  PaddleOCR      │
│  & Confirms     │     │  Metadata       │     │  Text Extraction│
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Paper Stored   │────▶│  Topics         │
│  in MongoDB     │     │  Aggregated     │
└─────────────────┘     └─────────────────┘
```

### OCR Processing Steps

1. **Image Upload**: User uploads paper image via frontend
2. **File Transfer**: Node.js backend receives file via Multer
3. **OCR Request**: Backend sends image to Python OCR service
4. **Text Extraction**: PaddleOCR extracts text with confidence score
5. **AI Analysis**: Grok-3/Groq AI extracts structured metadata
6. **Auto-Fill**: Frontend displays suggested metadata
7. **User Confirmation**: User reviews and confirms details
8. **Storage**: Paper and extracted topics saved to MongoDB

---

## 🚀 Deployment Architecture

### Recommended Deployment Setup

| Component | Platform | URL Pattern |
|-----------|----------|-------------|
| Frontend | Vercel | `exam-ready.vercel.app` |
| Backend API | Render | `exam-ready-api.onrender.com` |
| OCR Service | Render | `exam-ready-ocr.onrender.com` |
| Database | MongoDB Atlas | `cluster.mongodb.net` |
| Images | Cloudinary | `res.cloudinary.com` |

### Deployment Flow

```
GitHub Repository
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
   ┌────────┐        ┌────────┐
   │ Vercel │        │ Render │
   │Frontend│        │Backend │
   └────────┘        │ + OCR  │
                     └────────┘
```

---

## 🔐 Environment Variables

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env)

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/exam-ready

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# PaddleOCR Service URL
OCR_SERVICE_URL=http://localhost:5001

# AI Service (Grok/Groq)
GROK_API_KEY=your-grok-api-key
GROK_API_URL=https://api.x.ai/v1/chat/completions
# OR
GROQ_API_KEY=your-groq-api-key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Development Options
USE_MOCK_OCR=false
USE_MOCK_AI=false
```

---

## 💻 Local Setup Instructions

### Prerequisites

- Node.js 18+ 
- Python 3.10+
- MongoDB (local or Atlas)
- Git

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/exam-ready.git
cd exam-ready
```

### Step 2: Setup Frontend

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your values
# Start development server
npm run dev
```

Frontend runs at: `http://localhost:3000`

### Step 3: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your MongoDB URI and other values
# Start development server
npm run dev
```

Backend runs at: `http://localhost:5000`

### Step 4: Setup OCR Service

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

# Start OCR service
python main.py
```

OCR service runs at: `http://localhost:5001`

### Step 5: Verify Setup

1. Open `http://localhost:3000` in browser
2. Register a new account
3. Try uploading a paper image
4. Verify OCR and AI extraction works

---

## 🌐 Production Deployment

### Deploy Frontend to Vercel

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend.onrender.com/api`
4. Deploy

### Deploy Backend to Render

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `cd backend && npm install && npm run build`
4. Set start command: `cd backend && npm start`
5. Add environment variables from `.env`
6. Deploy

### Deploy OCR Service to Render

1. Create new Web Service
2. Connect GitHub repository (ocr-service folder)
3. Set runtime to Python
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Deploy

### Post-Deployment

1. Update `OCR_SERVICE_URL` in backend to point to deployed OCR service
2. Update `FRONTEND_URL` for CORS
3. Test all endpoints

---

## 📡 API Overview

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/refresh` | POST | Refresh token |

### Papers

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/papers` | GET | Search papers with filters |
| `/api/papers/:id` | GET | Get paper by ID |
| `/api/papers/upload` | POST | Upload paper image |
| `/api/papers/:id/confirm` | POST | Confirm paper metadata |
| `/api/papers/:id/like` | POST | Like/unlike paper |
| `/api/papers/:id` | DELETE | Delete paper |

### Topics

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/topics` | GET | Get topics with filters |
| `/api/topics/top` | GET | Get top topics |

### Users

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/profile` | GET | Get user profile |
| `/api/users/profile` | PUT | Update profile |
| `/api/users/leaderboard` | GET | Get leaderboard |
| `/api/users/stats` | GET | Get user statistics |

### Stats

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats` | GET | Get platform statistics |
| `/api/stats/colleges` | GET | Get all colleges |
| `/api/stats/subjects` | GET | Get all subjects |

---

## 📸 Screenshots

### Landing Page
![Landing Page](assets/landing.png)

### Dashboard
![Dashboard](assets/dashboard.png)

### Paper Upload
![Upload Paper](assets/upload.png)

### Search Papers
![Search Papers](assets/search-papers.png)

### Topic Analysis
![Topic Analysis](assets/search-topics.png)

### Leaderboard
![Leaderboard](assets/leaderboard.png)

### User Profile
![Profile](assets/profile.png)

### Exam Paper View
![Exam Paper](assets/exam-paper.png)

---

## 🔮 Future Enhancements

1. **PDF Support** - Allow PDF uploads alongside images
2. **Question Bank** - Generate practice question sets from topics
3. **AI Study Assistance** - Chat with AI about specific topics
4. **Mobile App** - React Native mobile application
5. **Handwritten Text OCR** - Improved recognition for handwritten papers
6. **Social Features** - Follow users, share collections
7. **Analytics Dashboard** - Detailed stats for colleges/departments
8. **Offline Mode** - PWA with offline paper viewing

---

## ⚠️ Limitations

1. **OCR Accuracy** - Performance varies with image quality and handwriting
2. **AI Extraction** - Metadata extraction depends on paper format consistency
3. **Language Support** - Currently optimized for English papers only
4. **Cold Starts** - Render free tier has service spin-up delays
5. **File Size** - Limited to images under 10MB
6. **Rate Limiting** - API requests are rate-limited to prevent abuse

---

## 📝 Conclusion

**Exam Ready** addresses a real problem faced by engineering students by providing a centralized, intelligent platform for exam paper discovery and analysis. 

The application demonstrates:

- **Full-Stack Development** - Next.js frontend + Express backend + Python microservice
- **AI/ML Integration** - OCR and AI-powered metadata extraction
- **Database Design** - MongoDB with efficient indexing and aggregations
- **Modern Architecture** - Microservices, REST APIs, JWT authentication
- **Production Readiness** - Deployment configurations for multiple platforms
- **User Experience** - Modern UI with gamification and responsive design

This project serves as a comprehensive demonstration of modern web development practices and can be extended to serve institutions at scale.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ for Engineering Students
</p>