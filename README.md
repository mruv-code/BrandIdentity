# BrandSync — Unified Username & Domain Availability Engine

BrandSync is a production-grade, deployment-ready SaaS web application designed to help users concurrently check username and domain availability across social media networks and DNS registries.

This repository features two entirely separate, modular applications for deployment convenience:
- `/frontend` — Optimized React + Vite SPA designed for Vercel.
- `/backend` — Production Node.js + Express + TypeScript API server designed for Render.

---

## 🛠️ Project Architecture

```
/ (Workspace Root)
├── /frontend               # Client SPA (Vercel)
│   ├── src/                # React Components, Views, & Hooks
│   ├── .env.example        # Client Configuration Guide
│   ├── package.json        
│   └── vercel.json         # Vercel SPARouting config
└── /backend                # API Server (Render)
    ├── src/                # Express TypeScript Server Code
    ├── .env.example        # Backend Credentials Guide
    ├── tsconfig.json       
    └── package.json        
```

---

## 🚀 Deployment Instructions

### 1. GitHub Setup

Since BrandSync is structured as a single multi-directory repository (mono-repo style), you can push the entire project directly to your GitHub repository:

1. Create a new, blank repository on [GitHub](https://github.com).
2. Initialize and push your code:
   ```bash
   git init
   git add .
   git commit -m "Initialize BrandSync SaaS Production Repository"
   git branch -M main
   git remote add origin https://github.com/your-username/brandsync.git
   git push -u origin main
   ```

---

### 2. Backend Deployment (Render Setup)

The Express backend is hosted on [Render](https://render.com) and resolves the concurrent platform queries.

1. Create a free account or sign in on [Render](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Configure the Web Service settings:
   - **Name**: `brandsync-backend`
   - **Language**: `Node`
   - **Root Directory**: `backend` (⚠️ *Crucial: set this to point to the backend subdirectory*)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Head to **Environment** tab and add the variables:
   - `PORT`: `10000` (Render defaults to process.env.PORT, leaving this blank is also safe)
   - `GEMINI_API_KEY`: *your-google-ai-studio-api-key*
   - `FRONTEND_URL`: *your-vercel-frontend-deployment-url* (e.g., `https://brandsync.vercel.app`)
6. Click **Deploy Web Service**. Grab your generated render URL (e.g. `https://brandsync-backend.onrender.com`).

---

### 3. Frontend Deployment (Vercel Setup)

The React single-page application is hosted for free on [Vercel](https://vercel.com).

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** and choose **Project**.
3. Import your GitHub repository.
4. Configure the Vercel project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (⚠️ *Set this to point to the frontend subdirectory*)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: *your-render-backend-url-from-step-2* (e.g. `https://brandsync-backend.onrender.com`)
6. Click **Deploy**. Vercel will transpile your application and hand you a production live domain.

---

## 🔒 Security Commitments

1. **No Database Search Logs**: To prevent domain speculation/squatting, searched usernames and domain lookups are evaluated on-the-fly and discarded instantly from volatile process memory.
2. **CORS Isolation**: The Node API is armed with CORS blocks to restrict unauthorized page lookups.
3. **Lazy AI Hooking**: Gemini AI services automatically fallback to local offline brand algorithms if the environment key is absent—avoiding crashes in developer offline tests.
