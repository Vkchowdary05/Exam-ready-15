# Keep-Alive Configuration for Exam Ready

This document explains how to keep the backend continuously running on free-tier hosting.

## Problem

Free-tier hosting services (Render, Railway, Vercel Serverless) shut down after 15-30 minutes of inactivity to conserve resources.

## Solution

Use a free uptime monitoring service to ping the backend every 5 minutes.

---

## Quick Setup (UptimeRobot)

1. Go to [uptimerobot.com](https://uptimerobot.com) and create a free account
2. Click **"Add New Monitor"**
3. Configure:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `Exam Ready Backend`
   - **URL**: `https://YOUR-BACKEND-URL/health`
   - **Monitoring Interval**: `5 minutes`
4. Click **Create Monitor**

The service will now ping `/health` every 5 minutes, preventing sleep mode.

---

## Alternative Free Services

| Service | Interval | Link |
|---------|----------|------|
| Cron-job.org | 1 min | [cron-job.org](https://cron-job.org) |
| Better Uptime | 3 min | [betteruptime.com](https://betteruptime.com) |
| Freshping | 1 min | [freshping.io](https://freshping.io) |

---

## Verifying It Works

### Test Health Endpoint
```bash
curl https://YOUR-BACKEND-URL/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-20T...",
    "uptime": 12345,
    "version": "1.0.0"
  }
}
```

### Check UptimeRobot Dashboard
- Monitor should show "UP" status
- Response time graph should be visible
- No downtime alerts

---

## For Academic Presentation

**Explain to examiners:**
1. Free hosting has inactivity timeouts
2. External cron pings prevent shutdown
3. Zero cost, cloud-based, automatic
4. Uptime stats available for documentation

---

## Production URLs

Update these after deployment:

- **Backend**: `https://_____.vercel.app`
- **Frontend**: `https://_____.vercel.app`
- **Health Check**: `https://_____.vercel.app/health`
