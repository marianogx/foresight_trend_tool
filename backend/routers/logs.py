from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend import models, schemas, database

router = APIRouter(
    prefix="/logs",
    tags=["logs"],
)

@router.get("/", response_model=List[schemas.SystemLog])
def get_logs(
    skip: int = 0,
    limit: int = 50,
    level: Optional[str] = None,
    event_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(models.SystemLog)
    
    if level and level != "ALL":
        query = query.filter(models.SystemLog.level == level)
        
    if event_type and event_type != "ALL":
        query = query.filter(models.SystemLog.event_type == event_type)
        
    if search:
        query = query.filter(models.SystemLog.message.contains(search))
        
    # Order by newest first
    return query.order_by(models.SystemLog.timestamp.desc()).offset(skip).limit(limit).all()
