# 📚 Exam Ready

**AI-Powered Exam Paper Sharing Platform for Students**

A production-ready full-stack web application that enables students to upload, share, and discover past examination papers with intelligent OCR text extraction, AI-powered topic analysis, and gamification features.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🎯 Project Overview

**Exam Ready** solves a critical problem faced by engineering students: **fragmented access to past exam papers**. Students often struggle to find relevant question papers from their specific college, subject, and exam type.

This platform provides:
- **Centralized repository** of past examination papers
- **Intelligent OCR** that extracts and structures questions automatically
- **AI-powered topic frequency analysis** to identify high-priority topics
- **Social features** with likes, bookmarks, and leaderboards
- **Gamification** to incentivize quality contributions

---

## 💡 Why This Project Matters

| Problem | Solution |
|---------|----------|
| Past papers scattered across WhatsApp groups | Centralized, searchable database |
| Manual topic extraction is time-consuming | AI automatically identifies topics |
| No way to know which topics are important | Topic frequency analysis with visual heat mapping |
| Low-quality or mislabeled uploads | Community moderation + admin verification |
| No incentive to share resources | Gamification with credits, badges, and leaderboards |

---

## ✨ Key Features

### Core Functionality
- **Smart Paper Upload** — Drag-and-drop with automatic OCR text extraction
- **Advanced Search** — Filter by college, subject, semester, branch, year, exam type
- **Topic Frequency Analysis** — Identify most-asked topics across papers
- **AI Prompt Generator** — Generate study prompts for high-frequency topics

### User Experience
- **4 Theme System** — Simple, Modern, Tech, and Nerdy themes
- **Responsive Design** — Mobile-first, works on all devices
- **3D Animations** — Three.js powered landing page
- **Smooth Transitions** — Framer Motion UI animations

### Social & Gamification
- **Like & Bookmark** papers for quick access
- **Credit System** — Earn credits for uploads
- **8 Badge Types** — Unlock achievements as you contribute
- **Leaderboards** — Global, college-wise, and subject-wise rankings

### Admin & Moderation
- **Admin Dashboard** — Platform statistics and health monitoring
- **Content Moderation** — Review flagged papers
- **User Management** — Ban/unban users, manage roles

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first styling |
| **Zustand** | Lightweight state management |
| **React Hook Form + Zod** | Form handling with validation |
| **Three.js** | 3D animations on landing page |
| **Framer Motion** | UI animations and transitions |
| **Radix UI** | Accessible component primitives |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | REST API server |
| **TypeScript** | Type-safe backend |
| **MongoDB + Mongoose** | NoSQL database with ODM |
| **JWT** | Stateless authentication |
| **Tesseract.js** | Optical Character Recognition |
| **Groq API (Llama 3.3)** | AI-powered metadata extraction |
| **Cloudinary** | Cloud image storage and CDN |
| **Winston** | Structured logging |

### DevOps & Security
| Technology | Purpose |
|------------|---------|
| **Helmet** | HTTP security headers |
| **express-rate-limit** | API rate limiting |
| **bcryptjs** | Password hashing (10 rounds) |
| **express-mongo-sanitize** | NoSQL injection prevention |
| **Zod** | Runtime input validation |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Next.js    │  │  Zustand    │  │  Three.js   │             │
│  │  App Router │  │  Store      │  │  3D Scene   │             │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘             │
└─────────┼────────────────┼──────────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     REST API (Express.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Auth    │  │  Papers  │  │  Topics  │  │  Admin   │        │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │               │
│  ┌────▼─────────────▼─────────────▼─────────────▼────┐         │
│  │              Middleware Layer                      │         │
│  │  [Auth] [Rate Limit] [Validation] [Error Handler] │         │
│  └────────────────────────┬──────────────────────────┘         │
└───────────────────────────┼─────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
   │  MongoDB    │   │  Cloudinary │   │  Groq API   │
   │  Atlas      │   │  (Images)   │   │  (AI/LLM)   │
   └─────────────┘   └─────────────┘   └─────────────┘
```

---

## 🔄 How the Web App Works

### 1. User Registration & Authentication
```
User → Register → Email/Password + College Info → JWT Token → Access Platform
```

### 2. Paper Upload Flow
```
User uploads image → Tesseract.js OCR → Extract text → 
Groq AI analyzes → Extract questions/topics → Store in MongoDB → 
User confirms metadata → Paper published
```

### 3. Search & Discovery
```
User applies filters → API query with pagination → 
MongoDB aggregation → Return matching papers → 
Display with like/bookmark actions
```

### 4. Topic Analysis
```
Select college/subject/exam type → Query papers → 
Aggregate topics across all matching papers → 
Calculate frequency → Display heat-mapped results
```

---

## 📡 API Endpoints Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Authenticate user |
| POST | `/api/auth/verify-email` | Verify email with OTP |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/auth/me` | Get current user profile |

### Papers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/papers` | Search papers with filters |
| GET | `/api/papers/:id` | Get paper by ID |
| POST | `/api/papers/upload` | Upload new paper (multipart) |
| POST | `/api/papers/:id/confirm` | Confirm paper metadata |
| POST | `/api/papers/:id/like` | Toggle like on paper |
| DELETE | `/api/papers/:id` | Delete own paper |

### Topics & Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/topics` | Get topic analysis |
| GET | `/api/stats` | Platform statistics |
| GET | `/api/users/leaderboard` | User rankings |

---

## 🗄️ Database Schema Overview

### User Collection
```javascript
{
  email: String,          // Unique, validated
  password: String,       // Hashed with bcrypt
  name: String,
  college: String,        // Indexed for filtering
  branch: String,
  semester: String,
  credits: Number,        // Gamification points
  badges: [{              // Achievement badges
    badgeId, name, icon, unlockedAt
  }],
  role: 'user' | 'admin' | 'moderator',
  bookmarks: [ObjectId],  // Reference to papers
  theme: String,
  preferences: Object
}
```

### Paper Collection
```javascript
{
  uploadedBy: ObjectId,   // Reference to user
  college: String,
  subject: String,
  semester: String,
  branch: String,
  examType: 'semester' | 'midterm1' | 'midterm2',
  year: Number,
  originalImage: String,  // Cloudinary URL
  formattedText: {
    partA: [{ questionNumber, question, marks, topic }],
    partB: [{ questionNumber, question, marks, topic }]
  },
  metadata: {
    ocrConfidence: Number,
    extractionMethod: String
  },
  likes: Number,
  likedBy: [ObjectId],
  verified: Boolean,
  flagged: Boolean
}
```

---

## 🔐 Authentication & Security

### Security Measures Implemented

| Measure | Implementation |
|---------|----------------|
| **Password Hashing** | bcrypt with 10 salt rounds |
| **JWT Tokens** | 7-day expiry, role-based claims |
| **Rate Limiting** | 100 req/15min general, 5 req/min for auth |
| **Input Validation** | Zod schemas on all endpoints |
| **NoSQL Injection** | express-mongo-sanitize |
| **XSS Protection** | Helmet security headers |
| **CORS** | Whitelist-based origin control |

### Authentication Flow
```
POST /auth/login
  ↓
Validate credentials (Zod)
  ↓
Find user, compare password (bcrypt)
  ↓
Generate JWT with userId, email, role
  ↓
Return token + user data
  ↓
Client stores token in localStorage
  ↓
Subsequent requests include: Authorization: Bearer <token>
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Groq API key (for AI features)

### Clone Repository
```bash
git clone https://github.com/yourusername/exam-ready.git
cd exam-ready
```

### Install Dependencies
```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/exam-ready

# Authentication
JWT_SECRET=your-256-bit-secret
JWT_EXPIRES_IN=7d

# Cloud Services
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# AI Services
GROQ_API_KEY=your-groq-key

# CORS
FRONTEND_URL=http://localhost:3000
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 💻 Running the Project Locally

### Start Backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### Start Frontend
```bash
# In root directory
npm run dev
# App runs on http://localhost:3000
```

### Health Check
```bash
curl http://localhost:5000/health
# Returns: { "status": "healthy", "uptime": ..., "version": "1.0.0" }
```

---

## 🌐 Deployment Details

### Current Deployment
| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | `exam-ready-frontend.vercel.app` |
| Backend | Render | `exam-ready-backend-8pi0.onrender.com` |
| Database | MongoDB Atlas | Cloud cluster |
| Images | Cloudinary | CDN delivery |

### Keep-Alive Configuration
To prevent Render's free tier from sleeping:
- **UptimeRobot** pings `/health` every 5 minutes
- See `KEEPALIVE.md` for setup instructions

---

## 📸 Screenshots

### Landing Page
![Landing Page](assets/landing.png)

### Dashboard
![Dashboard](assets/dashboard.png)

### Paper Upload
![Upload Page](assets/upload.png)

### Search Papers
![Search Papers](assets/search-papers.png)

### Search Topics
![Search Topics](assets/search-topics.png)

### Exam Paper View
![Exam Paper](assets/exam-paper.png)

### Leaderboard
![Leaderboard](assets/leaderboard.png)

### User Profile
![Profile](assets/profile.png)

---

## 🔮 Future Enhancements

- [ ] **Real-time Notifications** — WebSocket integration
- [ ] **PDF Support** — Direct PDF upload with text extraction
- [ ] **Comment System** — Discuss questions on papers
- [ ] **Study Groups** — Collaborative topic preparation
- [ ] **Mobile App** — React Native companion app
- [ ] **Advanced Analytics** — ML-based topic prediction

---

## 🧩 Challenges Solved

| Challenge | Solution |
|-----------|----------|
| OCR accuracy on handwritten text | Tesseract.js with preprocessing + AI refinement |
| Scaling topic aggregation | MongoDB aggregation pipelines with indexes |
| Free-tier hosting sleep | UptimeRobot keep-alive mechanism |
| Duplicate paper detection | Compound index on all metadata fields |
| Rate limiting abuse | Tiered rate limits (general, auth, upload) |

---

## 👀 What Recruiters Should Notice

### Clean Architecture
- **Separation of concerns** — Routes → Controllers → Services → Models
- **Type safety** — Full TypeScript coverage on frontend and backend
- **Consistent patterns** — Uniform error handling, response formatting

### Production-Ready Practices
- **Security-first approach** — Rate limiting, input validation, secure headers
- **Scalable database design** — Proper indexing, compound indexes for queries
- **Comprehensive logging** — Winston with structured logs

### Modern Tech Integration
- **AI/ML Pipeline** — Groq LLM for intelligent metadata extraction
- **Cloud-native** — Cloudinary CDN, MongoDB Atlas, Vercel/Render deployment
- **Real OCR** — Tesseract.js for actual text extraction (not mock)

### Full-Stack Competency
- **Frontend** — Next.js App Router, 3D graphics, state management
- **Backend** — REST API design, authentication, file uploads
- **DevOps** — Environment configuration, deployment, uptime monitoring

---

## 🤝 Contributing Guidelines

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- Run `npm run lint` before committing
- Follow TypeScript strict mode
- Write meaningful commit messages

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 📬 Contact

**Developer:** Papasani Karthik  
**Email:** [your-email@example.com]  
**LinkedIn:** [linkedin.com/in/yourprofile]  
**GitHub:** [github.com/yourusername]

---

<div align="center">

**Built with ❤️ for students, by a student**

⭐ Star this repo if you find it useful!

</div>