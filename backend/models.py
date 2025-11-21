from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
import enum

class SignalStrength(str, enum.Enum):
    STRONG = "strong"
    MEDIUM = "medium"
    LOW = "low"
    NOT_SIGNAL = "not_signal"
    PENDING = "pending"

class Feed(Base):
    __tablename__ = "feeds"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    url = Column(String, unique=True, index=True)
    category = Column(String, nullable=True) # e.g. "Tech", "Finance"
    active = Column(Boolean, default=True)
    last_fetched_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    articles = relationship("Article", back_populates="feed")

class Setting(Base):
    __tablename__ = "settings"

    key = Column(String, primary_key=True, index=True)
    value = Column(String)

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    feed_id = Column(Integer, ForeignKey("feeds.id"))
    title = Column(String, index=True)
    url = Column(String, unique=True, index=True)
    summary = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    published_at = Column(DateTime, nullable=True)
    
    # Categorization
    steepv_category = Column(String, nullable=True) # Social, Tech, Econ, Env, Pol, Values
    industry = Column(String, nullable=True)
    
    # Curation
    # Curation
    is_featured = Column(Boolean, default=False) # For the weekly trend report
    signal_strength = Column(String, default=SignalStrength.PENDING.value)
    ai_reasoning = Column(Text, nullable=True) # Why it was categorized this way
    admin_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    feed = relationship("Feed", back_populates="articles")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="viewer") # admin, editor, viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class TrendSummary(Base):
    __tablename__ = "trend_summaries"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(Text) # The AI generated narrative
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_published = Column(Boolean, default=False)

class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    level = Column(String) # INFO, WARNING, ERROR
    event_type = Column(String) # FEED, AI, SYSTEM, USER
    message = Column(String)
    details = Column(JSON, nullable=True)
