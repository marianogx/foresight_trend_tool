"""
Export local database to JSON for migration to Render
"""
import sqlite3
import json
from pathlib import Path

# Connect to local database
db_path = Path(__file__).parent / "foresight.db"
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [row[0] for row in cursor.fetchall()]
print(f"📋 Found tables: {', '.join(tables)}")

# Export data
export_data = {}

# Export each table if it exists
table_names = ['feeds', 'articles', 'settings', 'trend_summaries', 'system_logs']
for table in table_names:
    if table in tables:
        cursor.execute(f"SELECT * FROM {table}")
        export_data[table] = [dict(row) for row in cursor.fetchall()]
    else:
        export_data[table] = []
        print(f"⚠️  Table '{table}' not found, skipping")

conn.close()

# Save to JSON
output_path = Path(__file__).parent / "db_export.json"
with open(output_path, 'w') as f:
    json.dump(export_data, f, indent=2, default=str)

print(f"\n✅ Database exported to {output_path}")
print(f"📊 Exported:")
for table in table_names:
    if table in export_data:
        print(f"   - {len(export_data[table])} {table}")
