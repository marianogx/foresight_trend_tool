from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./foresight.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # Check feeds
    result = db.execute(text("SELECT count(*) FROM feeds"))
    feed_count = result.scalar()
    print(f"Feeds: {feed_count}")

    # Check articles
    result = db.execute(text("SELECT count(*) FROM articles"))
    article_count = result.scalar()
    print(f"Articles: {article_count}")
    
    if article_count > 0:
        result = db.execute(text("SELECT title, steepv_category FROM articles LIMIT 5"))
        for row in result:
            print(f"- {row[0]} ({row[1]})")

except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
