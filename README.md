# NEXUS - Gaming OS Style Platform

Monorepo layout:
- frontend: Next.js 14 App Router UI
- backend: Express + MongoDB + Socket.io + Groq AI
- shared: Shared TypeScript types

## Prerequisites
- Node.js 20+
- npm 10+
- MongoDB Atlas URI
- Groq API key

## Setup
1. Copy `.env.example` values into:
   - `backend/.env`
   - `frontend/.env.local`
2. Install and run backend:
```bash
cd backend
npm install
npm run dev
```
3. Install and run frontend:
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000` and backend at `http://localhost:5000`.
