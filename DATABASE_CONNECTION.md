# Database Connection Guide

## Current Setup

The application is configured to automatically use the correct backend:

- **Production (Vercel)**: Uses Render backend at `https://foresight-trend-tool.onrender.com`
- **Local Development**: Uses `localhost:8000`

## Viewing Your Data

### Option 1: View on Vercel (Recommended)
Your deployed Vercel frontend already has all the data from Render:
- Visit your Vercel URL (check Vercel dashboard)
- All 26 feeds and articles are available there

### Option 2: Connect Local Frontend to Render
If you want to see Render data while developing locally:

1. Create a `.env.local` file in the frontend root:
```bash
NEXT_PUBLIC_API_URL=https://foresight-trend-tool.onrender.com
```

2. Restart your dev server:
```bash
npm run dev
```

Now your local frontend will connect to the Render backend with all the data.

### Option 3: Populate Local Database
If you want to work with data locally:

1. Run the import script pointing to localhost:
```bash
cd backend
python3 import_to_render.py http://localhost:8000
```

This will import all 26 feeds to your local database.

## Current Data on Render
- ✅ 26 RSS feeds (Fintech, AI, AR/VR, HealthTech, Robotics, Web3, etc.)
- ✅ Backend API running at `https://foresight-trend-tool.onrender.com`
- ✅ Frontend deployed on Vercel (connected to Render)

## Note
The local backend (`localhost:8000`) starts with an empty database. The Render backend has all your migrated data.
