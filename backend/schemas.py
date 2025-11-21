from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class FeedBase(BaseModel):
    name: str
    url: str
    category: Optional[str] = None
    active: bool = True

class FeedCreate(FeedBase):
    pass

class FeedUpdate(BaseModel):
    name: str
    url: str
    category: Optional[str] = None

class Feed(FeedBase):
    id: int
    last_fetched_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ArticleBase(BaseModel):
    title: str
    url: str
    summary: Optional[str] = None
    image_url: Optional[str] = None
    published_at: Optional[datetime] = None
    steepv_category: Optional[str] = None
    industry: Optional[str] = None
    signal_strength: Optional[str] = "pending"
    ai_reasoning: Optional[str] = None
    admin_notes: Optional[str] = None

class Article(ArticleBase):
    id: int
    feed_id: int
    is_featured: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Setting(BaseModel):
    key: str
    value: str

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: str
    role: str = "viewer"
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TrendSummaryBase(BaseModel):
    title: str
    content: str
    start_date: datetime
    end_date: datetime
    is_published: bool = False

class TrendSummary(TrendSummaryBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class SystemLogBase(BaseModel):
    level: str
    event_type: str
    message: str
    details: Optional[Dict[str, Any]] = None

class SystemLog(SystemLogBase):
    id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True
