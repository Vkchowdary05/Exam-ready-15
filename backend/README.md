# Exam Ready - Backend API

A production-ready Express.js + TypeScript backend API for the Exam Ready platform.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Server runs at `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /verify-email` - Verify email with OTP
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `POST /refresh` - Refresh JWT token
- `GET /me` - Get current user

### Users (`/api/users`)
- `GET /profile` - Get profile
- `PUT /profile` - Update profile
- `PUT /settings` - Update settings
- `POST /profile-picture` - Upload avatar
- `GET /stats` - Get user statistics
- `GET /leaderboard` - Get leaderboard
- `PUT /change-password` - Change password
- `POST /bookmark/:paperId` - Bookmark paper
- `GET /bookmarks` - Get bookmarks

### Papers (`/api/papers`)
- `POST /upload` - Upload paper (OCR + AI processing)
- `POST /:id/confirm` - Confirm paper after review
- `GET /` - Search papers with filters
- `GET /:id` - Get single paper
- `PUT /:id` - Update paper
- `DELETE /:id` - Delete paper
- `POST /:id/like` - Like/unlike paper
- `POST /:id/report` - Report paper
- `GET /:id/related` - Get related papers
- `GET /my-uploads` - User's uploads

### Topics (`/api/topics`)
- `GET /` - Get topics with filters
- `POST /prompt` - Generate study prompt

### Stats (`/api/stats`)
- `GET /` - Platform overview
- `GET /colleges` - Unique colleges
- `GET /subjects` - Unique subjects
- `GET /branches` - Unique branches

### Notifications (`/api/notifications`)
- `GET /` - Get notifications
- `PUT /:id/read` - Mark as read
- `PUT /read-all` - Mark all as read

### Admin (`/api/admin`)
- `GET /papers/flagged` - Get flagged papers
- `PUT /papers/:id/verify` - Verify paper
- `DELETE /papers/:id` - Delete paper
- `GET /users` - Get all users
- `PUT /users/:id/role` - Update user role

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `FRONTEND_URL` | Frontend URL for CORS |
| `GOOGLE_VISION_API_KEY` | Google Cloud Vision API key |
| `GROK_API_KEY` | Grok-3 API key |
| `CLOUDINARY_*` | Cloudinary credentials |

## Development Mode

These flags enable mock services:
- `SKIP_EMAIL_VERIFICATION=true` - Auto-verify emails
- `USE_MOCK_OCR=true` - Use mock OCR responses
- `USE_MOCK_AI=true` - Use mock AI responses

## Scripts

```bash
npm run dev      # Development with hot reload
npm run build    # Build for production
npm start        # Run production build
npm test         # Run tests
```

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcryptjs
- **Validation**: Zod
- **File Upload**: Multer + Cloudinary
- **Security**: Helmet, CORS, Rate Limiting
