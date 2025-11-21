from sqlalchemy.orm import Session
from backend import models
import traceback

def log_event(db: Session, level: str, event_type: str, message: str, details: dict = None):
    """
    Logs a system event to the database.
    
    Args:
        db: Database session
        level: INFO, WARNING, ERROR
        event_type: FEED, AI, SYSTEM, USER
        message: Short description of the event
        details: Optional dictionary with more context
    """
    try:
        log_entry = models.SystemLog(
            level=level,
            event_type=event_type,
            message=message,
            details=details
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        print(f"FAILED TO LOG EVENT: {e}")
        # Don't raise exception to avoid breaking the main flow
