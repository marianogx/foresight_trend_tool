"""
Import database from JSON export to deployed Render backend
Usage: python3 import_to_render.py <RENDER_URL>
Example: python3 import_to_render.py https://foresight-trend-tool.onrender.com
"""
import json
import requests
import sys
from pathlib import Path

if len(sys.argv) < 2:
    print("❌ Usage: python3 import_to_render.py <RENDER_URL>")
    print("   Example: python3 import_to_render.py https://foresight-trend-tool.onrender.com")
    sys.exit(1)

RENDER_URL = sys.argv[1].rstrip('/')
API_URL = RENDER_URL  # FastAPI routes are at root, not /api

# Load exported data
export_path = Path(__file__).parent / "db_export.json"
if not export_path.exists():
    print(f"❌ Export file not found: {export_path}")
    print("   Run 'python3 export_db.py' first")
    sys.exit(1)

with open(export_path, 'r') as f:
    data = json.load(f)

print(f"📦 Loaded export data:")
print(f"   - {len(data.get('feeds', []))} feeds")
print(f"   - {len(data.get('articles', []))} articles")
print(f"   - {len(data.get('settings', []))} settings")
print(f"   - {len(data.get('trend_summaries', []))} trend summaries")
print(f"\n🚀 Importing to {API_URL}...\n")

# Import feeds
feeds_imported = 0
for feed in data.get('feeds', []):
    try:
        # Remove id and timestamps, let the server generate them
        feed_data = {
            'name': feed['name'],
            'url': feed['url'],
            'category': feed.get('category'),
            'is_active': feed.get('is_active', True)
        }
        response = requests.post(f"{API_URL}/feeds/", json=feed_data)
        if response.status_code in [200, 201]:
            feeds_imported += 1
            print(f"✅ Imported feed: {feed['name']}")
        else:
            print(f"⚠️  Failed to import feed '{feed['name']}': {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Error importing feed '{feed.get('name', 'unknown')}': {e}")

# Import settings
settings_imported = 0
for setting in data.get('settings', []):
    try:
        setting_data = {
            'key': setting['key'],
            'value': setting['value']
        }
        response = requests.post(f"{API_URL}/settings/", json=setting_data)
        if response.status_code in [200, 201]:
            settings_imported += 1
            print(f"✅ Imported setting: {setting['key']}")
        else:
            print(f"⚠️  Failed to import setting '{setting['key']}': {response.status_code}")
    except Exception as e:
        print(f"❌ Error importing setting '{setting.get('key', 'unknown')}': {e}")

print(f"\n✨ Import complete!")
print(f"   - {feeds_imported}/{len(data.get('feeds', []))} feeds imported")
print(f"   - {settings_imported}/{len(data.get('settings', []))} settings imported")
print(f"\n💡 Note: Articles will be fetched automatically by the scheduler")
