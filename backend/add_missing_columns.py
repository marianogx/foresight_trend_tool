from backend.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text('ALTER TABLE articles ADD COLUMN signal_strength TEXT DEFAULT "pending"'))
        print('Column signal_strength added')
    except Exception as e:
        print(f'signal_strength: {e}')
    
    try:
        conn.execute(text('ALTER TABLE articles ADD COLUMN ai_reasoning TEXT'))
        print('Column ai_reasoning added')
    except Exception as e:
        print(f'ai_reasoning: {e}')
    
    try:
        conn.execute(text('ALTER TABLE articles ADD COLUMN admin_notes TEXT'))
        print('Column admin_notes added')
    except Exception as e:
        print(f'admin_notes: {e}')
    
    conn.commit()
    print('All columns added successfully')
