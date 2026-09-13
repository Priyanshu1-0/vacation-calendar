# Vacation Calendar

Public-holiday calendar with ISO-week highlighting. Pick a country and year; weeks are shaded by how many **weekdays (Mon–Fri)** have a public holiday in that week.

| | |
|---|---|
| **Live App** | https://vacation-calendar-two.vercel.app |
| **Repository** | https://github.com/Priyanshu1-0/vacation-calendar |

## Behavior

- **No shading** — zero weekday public holidays in the ISO week.
- **Light green** — exactly one weekday with a public holiday (entire week row).
- **Dark green** — two or more **distinct weekdays** with public holidays (same day with multiple names counts once).
- Weekends are excluded from the count; holiday names still appear on the date when the provider lists them.
- Countries and holidays are fetched at runtime ([Nager.Date](https://date.nager.at); optional [Calendarific](https://calendarific.com) for coverage gaps e.g. India).

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, plain JS |
| Backend | FastAPI, httpx, Pydantic Settings |
| Hosting | Vercel (UI), Render (API) |

## Repository layout

```text
backend/          FastAPI app, holiday providers, week shading
frontend/         React SPA
render.yaml       Render service definition (optional blueprint)
```

## Development

**Requirements:** Python 3.11+, Node 20+, npm

```bash
# API
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# UI (separate terminal)
cd frontend
npm install
npm run dev
```

Local UI: http://localhost:5173 — Vite proxies `/api` → `127.0.0.1:8000`.

## Configuration

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NAGER_BASE_URL` | `https://date.nager.at/api/v3` | Primary holiday API |
| `CALENDARIFIC_API_KEY` | _(empty)_ | Secondary provider; required for some country codes |
| `CALENDAR_DEFAULT_YEAR` | `2026` | Default `year` query param |
| `CACHE_TTL_SECONDS` | `3600` | In-memory upstream cache TTL |
| `HTTP_TIMEOUT_SECONDS` | `30` | Outbound HTTP timeout |

### Frontend (`frontend/.env`)

| Variable | Local | Production (Vercel) |
|----------|-------|---------------------|
| `VITE_API_BASE_URL` | _(empty — use proxy)_ | `https://vacation-calendar-bgq3.onrender.com` |
| `VITE_DEFAULT_YEAR` | `2026` | optional |

Production builds embed `VITE_*` at compile time; change env on Vercel → redeploy.

## API

Base URL: `/` on the backend host.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness |
| `GET` | `/api/countries` | Supported countries (merged sources) |
| `GET` | `/api/holidays?country_code=US&year=2026` | Public holidays for year |
| `GET` | `/api/calendar?country_code=US&year=2026` | Holidays + per-week `shade` (`none` \| `light` \| `dark`) |

Example:

```bash
curl "https://vacation-calendar-bgq3.onrender.com/api/calendar?country_code=ES&year=2026"
```

Week shading is computed in `backend/app/services/weeks.py` using ISO calendar weeks (`datetime.isocalendar()`).

## Deployment

Monorepo; two services from the same GitHub repo.

**Render (API)** — root directory `backend`, start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Vercel (UI)** — root directory `frontend`, build `npm run build`, output `dist`, set `VITE_API_BASE_URL` to the Render URL.

See `render.yaml` and `frontend/vercel.json` for reference configs. Render free tier cold-starts can add latency on the first request after idle.

## Notes

- Selecting a country returns **national aggregates** from the provider (e.g. Canada includes provincial holidays; labels may show `+N` when multiple observances share a date).
- CORS is currently `*` on the API; restrict to the Vercel origin for tighter production policy if needed.
