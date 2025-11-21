from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from .. import models, schemas, database

router = APIRouter(
    prefix="/articles",
    tags=["articles"],
)

@router.get("/", response_model=List[schemas.Article])
def read_articles(
    skip: int = 0, 
    limit: int = 100, 
    category: Optional[str] = None,
    industry: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Article)
    
    if category:
        query = query.filter(models.Article.steepv_category == category)
    if industry:
        query = query.filter(models.Article.industry == industry)
    if start_date:
        query = query.filter(models.Article.published_at >= start_date)
    if end_date:
        query = query.filter(models.Article.published_at <= end_date)
        
    articles = query.order_by(models.Article.published_at.desc()).offset(skip).limit(limit).all()
    return articles
