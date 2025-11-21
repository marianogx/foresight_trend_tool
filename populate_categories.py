from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import random

DATABASE_URL = "sqlite:///./foresight.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

categories = ["Social", "Technological", "Economic", "Environmental", "Political", "Values"]

try:
    # Update articles with null category
    articles = db.execute(text("SELECT id FROM articles WHERE steepv_category IS NULL")).fetchall()
    print(f"Found {len(articles)} articles without category.")
    
    for row in articles:
        category = random.choice(categories)
        db.execute(text("UPDATE articles SET steepv_category = :category WHERE id = :id"), {"category": category, "id": row[0]})
    
    db.commit()
    print("Successfully populated categories.")

except Exception as e:
    print(f"Error: {e}")
    db.rollback()
finally:
    db.close()
