# Vacation Calendar

Full-stack public holiday calendar: **light green** weeks have one weekday public holiday; **dark green** weeks have two or more (Mon–Fri only). React frontend + FastAPI backend.

## Local development

**Backend** (terminal 1):

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # optional: CALENDARIFIC_API_KEY for India / extra countries
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Frontend** (terminal 2):

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 (Vite proxies `/api` to the backend).

## GitHub: one repo or two?

Use **one repository (monorepo)** with this layout:

```text
Vacation_Calender/
  backend/    ← Python API
  frontend/   ← React app
  README.md
```

That is enough for a portfolio project: one link, one clone, one PR history. Split into two repos only if different teams own API vs UI.

### Push to GitHub

1. Create an empty repo on GitHub (no README if you already have one locally).
2. From the project root:

```bash
cd Vacation_Calender
git init
git add .
git commit -m "Initial vacation calendar app"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

Do **not** commit `backend/.env` (API keys). Only commit `.env.example` files.

## Deploy a shareable link (recommended: Render + Vercel)

You need **two hosts**: API (backend) and static site (frontend). The UI calls the API via `VITE_API_BASE_URL` (set at **build** time).

### Step 1 — Deploy backend (Render)

1. Sign in at [render.com](https://render.com) → **New** → **Web Service**.
2. Connect your GitHub repo.
3. Settings:
   - **Root directory:** `backend`
   - **Runtime:** Python
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Environment variables** (optional):
   - `CALENDARIFIC_API_KEY` — for India and countries not on Nager
   - `CALENDAR_DEFAULT_YEAR` — e.g. `2026`
5. Deploy. Copy the service URL, e.g. `https://vacation-calendar-api.onrender.com`.
6. Test: `https://YOUR-API.onrender.com/health` → `{"status":"ok"}`.

**Alternatives:** [Railway](https://railway.app), [Fly.io](https://fly.io) — same idea: run uvicorn on `0.0.0.0` and `$PORT`.

### Step 2 — Deploy frontend (Vercel)

1. Sign in at [vercel.com](https://vercel.com) → **Add New** → **Project** → import the same repo.
2. Settings:
   - **Root directory:** `frontend`
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
3. **Environment variable** (required for production):

   | Name | Value |
   |------|--------|
   | `VITE_API_BASE_URL` | `https://YOUR-API.onrender.com` (no trailing slash) |

   Optional: `VITE_DEFAULT_YEAR=2026`

4. Deploy. Vercel gives you a URL like `https://vacation-calendar.vercel.app` — **this is the link to share**.

### Step 3 — CORS

The API already allows all origins (`CORS` in `backend/app/main.py`). For production you can later restrict to your Vercel domain only.

### Free-tier notes

- **Render** free web services spin down when idle; first request may take ~30s.
- **Vercel** free tier is fine for static React builds.
- **Calendarific** free tier has monthly API limits if you use India/extra countries.

## Other frontend hosts

Same build as Vercel; set `VITE_API_BASE_URL` before build:

- [Netlify](https://netlify.com) — base directory `frontend`, publish `dist`
- [Cloudflare Pages](https://pages.cloudflare.com)

## Environment reference

| Variable | Where | Purpose |
|----------|--------|---------|
| `CALENDARIFIC_API_KEY` | Backend | India + 230+ countries |
| `CALENDAR_DEFAULT_YEAR` | Backend | Default year in API |
| `VITE_API_BASE_URL` | Frontend build | Production API URL |
| `VITE_DEFAULT_YEAR` | Frontend build | Default year in UI |

## API

- `GET /health`
- `GET /api/countries`
- `GET /api/calendar?country_code=US&year=2026`

Interactive docs: `/docs` on the backend URL.
