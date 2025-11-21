# Verifying Deployment Data

## Quick Check

Your deployed Vercel frontend should show data from Render. Here's how to verify:

1. **Visit your Vercel URL** (check your Vercel dashboard for the URL)
2. **Check the Admin Dashboard** - it should show:
   - Total Feeds: 26 (or 27 with the test feed)
   - Total Articles: (depends on how many have been fetched)
   - Pending Curation: (articles without signal strength)

## If Data is Not Showing

The most likely issue is that the Render backend needs to fetch articles from the feeds. The feeds are there, but articles need to be fetched.

### Option 1: Trigger Feed Fetch via API
Visit your Render backend directly and trigger a fetch:
```
https://foresight-trend-tool.onrender.com/feeds/fetch-all
```
(Use POST method)

### Option 2: Use the Admin Interface
1. Go to your deployed Vercel site
2. Navigate to Admin → Feeds
3. Click "Fetch All Feeds" button

### Option 3: Wait for Scheduler
The backend scheduler should automatically fetch feeds, but it may take time for the first run.

## Checking Render Backend Directly

You can verify the Render backend has data by visiting:
- `https://foresight-trend-tool.onrender.com/feeds/` - Should show 26-27 feeds
- `https://foresight-trend-tool.onrender.com/articles` - Should show articles (if fetched)

## Local vs Deployed

- **Local** (`localhost:3000`): Points to Render backend (shows Render data)
- **Deployed Vercel**: Points to Render backend (shows Render data)
- **Local Backend** (`localhost:8000`): Empty database (unless you import data)

Both your local frontend and deployed frontend should show the same data from Render!
