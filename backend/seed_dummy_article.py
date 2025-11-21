import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from database import SessionLocal, engine
import models
from datetime import datetime

def seed_dummy_article():
    db = SessionLocal()
    
    # Ensure a feed exists
    feed = db.query(models.Feed).filter(models.Feed.name == "Test Feed").first()
    if not feed:
        feed = models.Feed(
            name="Test Feed",
            url="http://test.com/rss",
            category="Test",
            active=True
        )
        db.add(feed)
        db.commit()
        db.refresh(feed)
        print(f"Created feed: {feed.name}")
    
    # Create a dummy article
    article = models.Article(
        feed_id=feed.id,
        title="The Future of AI Agents in 2025",
        url="http://test.com/article/1",
        summary="AI agents are becoming more autonomous and capable of complex tasks. This article explores the trends and implications for various industries.",
        content="Full content of the article...",
        image_url="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=60",
        published_at=datetime.utcnow(),
        steepv_category="Tech",
        industry="Software",
        signal_strength="pending",
        ai_reasoning="High relevance to current trends.",
        is_featured=False
    )
    
    # Check if exists
    existing = db.query(models.Article).filter(models.Article.url == article.url).first()
    if not existing:
        db.add(article)
        db.commit()
        print(f"Created article: {article.title}")
    else:
        print("Article already exists")
        
    db.close()

if __name__ == "__main__":
    seed_dummy_article()
