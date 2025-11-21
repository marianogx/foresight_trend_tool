# Foresight Trend Tool

A full-stack application for monitoring and analyzing trends via RSS feeds, categorized by STEEPV (Social, Technological, Economic, Environmental, Political, Values).

## Tech Stack
- **Backend**: FastAPI (Python), SQLAlchemy, SQLite, APScheduler.
- **Frontend**: Next.js (React), Tailwind CSS, shadcn/ui.

## Quick Start

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
uvicorn backend.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

See `walkthrough.md` for more details.
