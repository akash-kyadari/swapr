# SkillSwap

SkillSwap is a modern web application for skill exchange, allowing users to propose, accept, and complete skill swaps, chat in real time, and rate each other after successful exchanges.

---

## Features
- User authentication (email/password & Google OAuth)
- Skill marketplace: propose, accept, and manage swaps
- Real-time chat (Socket.IO)
- Task completion and approval workflow
- Two-way rating and review system
- User profiles with ratings and reviews
- Responsive, modern UI (Next.js + Tailwind CSS)
- **PWA support** (installable, offline-ready frontend)
- Secure, production-ready backend (Express, MongoDB)

---

## Project Structure

```
skillswap/
  backend/      # Node.js/Express API
  frontend/     # Next.js frontend (PWA)
```

---

## Backend Setup (Node.js/Express)

### 1. Environment Variables
Create a `.env` file in `backend/` with:
```
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://your-frontend-url
NODE_ENV=production
```

### 2. Install & Run Locally
```bash
cd backend
npm install
npm start
```
The backend will run on `http://localhost:5000` by default.

### 3. Deploy to Render
- Push your code to GitHub.
- Add a `render.yaml` (see docs or ask for a template).
- Create a new **Blueprint** on [Render](https://dashboard.render.com/), connect your repo, and set env vars.
- Your backend will be live at `https://your-backend.onrender.com`.

---

## Frontend Setup (Next.js + PWA)

### 1. Environment Variables
Create a `.env.local` file in `frontend/` with:
```
NEXT_PUBLIC_API_URL=https://your-backend-url
```

### 2. Install & Run Locally
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:3000` by default.

### 3. PWA Support
- The frontend is configured as a Progressive Web App (PWA):
  - Installable on mobile/desktop
  - Offline support (service worker)
  - Manifest and icons included
- To test PWA features, build and serve production:
```bash
npm run build
npm run start
```
- Visit in Chrome, open DevTools > Lighthouse > PWA to verify.

---

## Environment Variables (Summary)

**Backend:**
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret
- `FRONTEND_URL` — Public URL of your frontend
- `NODE_ENV` — `production` or `development`

**Frontend:**
- `NEXT_PUBLIC_API_URL` — Public URL of your backend

---

## Deployment Checklist
- [x] All API/socket URLs use environment variables
- [x] Security middleware enabled (helmet, CORS, rate limiting)
- [x] No secrets or debug logs in code
- [x] All sensitive config in `.env` files
- [x] PWA manifest and service worker in frontend
- [x] User-friendly error handling

---

## License
MIT
