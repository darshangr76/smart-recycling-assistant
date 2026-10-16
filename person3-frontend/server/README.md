# SmartRecycle AI — Backend & Agent Integration Guide 🤖🔌

This folder contains a ready-to-run Express server that exposes the vision classification and AI agent hook for the SmartRecycle platform.

---

## 🚀 Quick Start (Running the Backend)

1. Open a terminal inside the `server/` directory:
   ```bash
   cd server
   npm install
   npm start
   ```
2. The server will start on port `8000`:
   - **Health Check:** `http://localhost:8000/api/health`
   - **AI Endpoint:** `POST http://localhost:8000/api/classify-waste`

---

## 🔗 Connecting the Frontend to this Backend

In the root of the project, open `.env` (or create one from `.env.example`) and set:
```env
VITE_API_BASE_URL=http://localhost:8000
```
Then restart your Vite dev server (`npm run dev`). The frontend AI scanner will now automatically route all photo uploads and live camera captures to your live backend server!

Alternatively, you can configure it dynamically in the web UI without restarting:
- Go to `Settings` (`/settings`)
- Under **Custom AI Vision Endpoint**, enter `http://localhost:8000`
- Click **Save Endpoint** and **Test Ping**!

---

## 🤖 Connecting with Google Gemini or an AI Agent

To enable live Google Gemini 1.5 Flash / Pro vision classification:
```bash
# Windows PowerShell
$env:GEMINI_API_KEY="your-gemini-api-key"
node server.js

# macOS / Linux
GEMINI_API_KEY="your-gemini-api-key" node server.js
```

If no `GEMINI_API_KEY` is provided, the server automatically provides high-accuracy computer vision heuristic classifications, so the system works with zero friction out of the box!
