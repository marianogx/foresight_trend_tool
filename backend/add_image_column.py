from backend.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text('ALTER TABLE articles ADD COLUMN image_url TEXT'))
    conn.commit()
    print('Column image_url added successfully')
