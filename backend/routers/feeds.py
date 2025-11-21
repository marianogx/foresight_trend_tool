from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from ..services import rss_service

router = APIRouter(
    prefix="/feeds",
    tags=["feeds"],
)

@router.post("/", response_model=schemas.Feed)
def create_feed(feed: schemas.FeedCreate, db: Session = Depends(database.get_db)):
    db_feed = db.query(models.Feed).filter(models.Feed.url == feed.url).first()
    if db_feed:
        raise HTTPException(status_code=400, detail="Feed already registered")
    new_feed = models.Feed(**feed.dict())
    db.add(new_feed)
    db.commit()
    db.refresh(new_feed)
    db.refresh(new_feed)
    
    # Trigger fetch immediately
    try:
        rss_service.update_single_feed(db, new_feed)
    except Exception as e:
        print(f"Error fetching initial articles: {e}")
        
    return new_feed

@router.get("/", response_model=List[schemas.Feed])
def read_feeds(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    feeds = db.query(models.Feed).offset(skip).limit(limit).all()
    return feeds

@router.get("/{feed_id}", response_model=schemas.Feed)
def read_feed(feed_id: int, db: Session = Depends(database.get_db)):
    feed = db.query(models.Feed).filter(models.Feed.id == feed_id).first()
    if feed is None:
        raise HTTPException(status_code=404, detail="Feed not found")
    return feed

@router.delete("/{feed_id}")
def delete_feed(feed_id: int, db: Session = Depends(database.get_db)):
    feed = db.query(models.Feed).filter(models.Feed.id == feed_id).first()
    if feed is None:
        raise HTTPException(status_code=404, detail="Feed not found")
    db.delete(feed)
    db.commit()
    db.delete(feed)
    db.commit()
    return {"ok": True}

@router.post("/{feed_id}/fetch")
def fetch_feed(feed_id: int, db: Session = Depends(database.get_db)):
    feed = db.query(models.Feed).filter(models.Feed.id == feed_id).first()
    if not feed:
        raise HTTPException(status_code=404, detail="Feed not found")
    
    count = rss_service.update_single_feed(db, feed)
    return {"new_articles": count}

@router.patch("/{feed_id}", response_model=schemas.Feed)
def update_feed(feed_id: int, feed_update: schemas.FeedUpdate, db: Session = Depends(database.get_db)):
    feed = db.query(models.Feed).filter(models.Feed.id == feed_id).first()
    if not feed:
        raise HTTPException(status_code=404, detail="Feed not found")
    
    feed.name = feed_update.name
    feed.url = feed_update.url
    if feed_update.category:
        feed.category = feed_update.category
    
    db.commit()
    db.refresh(feed)
    return feed

@router.post("/fetch-all")
def fetch_all_feeds(db: Session = Depends(database.get_db)):
    total_articles = rss_service.update_feeds(db)
    return {"total_new_articles": total_articles}
