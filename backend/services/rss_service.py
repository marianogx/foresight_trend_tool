import feedparser
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from .. import models, schemas
from . import ai_service, logger

def fetch_feed_articles(feed_url: str):
    # Some servers block requests without a User-Agent
    return feedparser.parse(feed_url, agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

def update_single_feed(db: Session, feed: models.Feed):
    # Calculate start of current week (Monday)
    today = datetime.utcnow()
    start_of_week = today - timedelta(days=today.weekday())
    start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
    
    logger.log_event(db, "INFO", "FEED", f"Fetching feed: {feed.name}", {"url": feed.url})
    
    try:
        parsed_feed = fetch_feed_articles(feed.url)
        
        if parsed_feed.bozo:
            logger.log_event(db, "WARNING", "FEED", f"Potential issue parsing feed: {feed.name}", {"error": str(parsed_feed.bozo_exception)})
            # Continue if we have entries despite the error (common with encoding issues)
            if not parsed_feed.entries:
                return 0

        new_articles_count = 0
        
        # print(f"Fetching {feed.url}...") # Replaced by logger
        # print(f"Filter date: {start_of_week}") # Replaced by logger

        for entry in parsed_feed.entries:
            # Check if article exists
            existing = db.query(models.Article).filter(models.Article.url == entry.link).first()
            if existing:
                # print(f"Skipping existing: {entry.title}") # Replaced by logger
                logger.log_event(db, "DEBUG", "FEED", f"Skipping existing article: {entry.title}", {"feed_id": feed.id, "url": entry.link})
                continue
                
            # Parse date
            published_at = None
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                published_at = datetime(*entry.published_parsed[:6])
            elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                published_at = datetime(*entry.updated_parsed[:6])
                
            # print(f"Entry: {entry.title}, Date: {published_at}") # Replaced by logger

            # Filter for current week
            if published_at and published_at < start_of_week:
                # print(f"Skipping old article: {published_at}") # Replaced by logger
                logger.log_event(db, "DEBUG", "FEED", f"Skipping old article: {entry.title}", {"feed_id": feed.id, "published_at": published_at})
                continue

            # Content extraction
            content = ''
            if 'content' in entry:
                content = entry.content[0].value
            elif 'summary' in entry:
                content = entry.summary
            else:
                content = entry.get('description', '')

            # Image extraction
            image_url = None
            if 'media_content' in entry:
                media = entry.media_content
                if media and len(media) > 0:
                    image_url = media[0].get('url')
            elif 'media_thumbnail' in entry:
                media = entry.media_thumbnail
                if media and len(media) > 0:
                    image_url = media[0].get('url')
            elif 'links' in entry:
                for link in entry.links:
                    if link.get('type', '').startswith('image/'):
                        image_url = link.get('href')
                        break

            # AI Categorization for STEEPV
            steepv, ai_industry, reason = categorize_article(entry.title, entry.get('summary', ''), db)
            
            # Use feed's category as industry, fallback to AI if not set
            industry = feed.category if feed.category else ai_industry
                
            article = models.Article(
                feed_id=feed.id,
                title=entry.title,
                url=entry.link,
                summary=entry.get('summary', ''),
                content=content,
                image_url=image_url,
                published_at=published_at,
                steepv_category=steepv,
                industry=industry,
                ai_reasoning=reason,
                is_featured=False
            )
            db.add(article)
            new_articles_count += 1
            logger.log_event(db, "INFO", "FEED", f"New article found: {article.title}", {"feed_id": feed.id})
            
        feed.last_fetched_at = datetime.utcnow()
        db.commit()
        
        if new_articles_count > 0:
            logger.log_event(db, "INFO", "FEED", f"Fetched {new_articles_count} new articles from {feed.name}")
            
        return new_articles_count
    except Exception as e:
        logger.log_event(db, "ERROR", "FEED", f"Error fetching feed {feed.name}: {str(e)}", {"feed_id": feed.id, "error_details": str(e)})
        # print(f"Error fetching feed {feed.name}: {e}") # Replaced by logger
        return 0

def update_feeds(db: Session):
    feeds = db.query(models.Feed).filter(models.Feed.active == True).all()
    total_new = 0
    for feed in feeds:
        total_new += update_single_feed(db, feed)
    return total_new
