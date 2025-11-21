from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from backend import models, schemas, database
from backend.services import ai_service

router = APIRouter(
    prefix="/curation",
    tags=["curation"],
)

@router.patch("/articles/{article_id}", response_model=schemas.Article)
def curate_article(
    article_id: int, 
    signal_strength: str, 
    admin_notes: str = None,
    db: Session = Depends(database.get_db)
):
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    article.signal_strength = signal_strength
    if admin_notes:
        article.admin_notes = admin_notes
    
    db.commit()
    db.refresh(article)
    return article

@router.post("/generate-summary", response_model=schemas.TrendSummary)
def generate_summary(
    days: int = 7,
    min_signal_strength: str = "medium", # strong, medium, low
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(database.get_db)
):
    # Create a placeholder summary immediately
    trend_summary = models.TrendSummary(
        title=f"Weekly Trend Report - {datetime.utcnow().strftime('%Y-%m-%d')} (Generating...)",
        content="Report generation in progress...",
        start_date=datetime.utcnow() - timedelta(days=days),
        end_date=datetime.utcnow(),
        is_published=False
    )
    db.add(trend_summary)
    db.commit()
    db.refresh(trend_summary)

    # Define the background task function
    def generate_content_task(summary_id: int, days: int, min_signal: str):
        # Re-create session for background task
        db_bg = database.SessionLocal()
        try:
            summary = db_bg.query(models.TrendSummary).filter(models.TrendSummary.id == summary_id).first()
            if not summary:
                return

            cutoff_date = datetime.utcnow() - timedelta(days=days)
            allowed_strengths = ["strong"]
            if min_signal in ["medium", "low"]:
                allowed_strengths.append("medium")
            if min_signal == "low":
                allowed_strengths.append("low")
                
            articles = db_bg.query(models.Article).filter(
                models.Article.created_at >= cutoff_date,
                models.Article.signal_strength.in_(allowed_strengths)
            ).all()
            
            if not articles:
                summary.content = "No curated articles found for this period."
            else:
                summary.content = ai_service.generate_trend_summary(articles, db_bg)
                # Update title to remove "(Generating...)"
                summary.title = f"Weekly Trend Report - {datetime.utcnow().strftime('%Y-%m-%d')}"
            
            db_bg.commit()
        except Exception as e:
            print(f"Error generating summary: {e}")
            summary.content = f"Error generating report: {str(e)}"
            db_bg.commit()
        finally:
            db_bg.close()

    # Add task to background
    background_tasks.add_task(generate_content_task, trend_summary.id, days, min_signal_strength)
    
    return trend_summary

@router.get("/summaries", response_model=List[schemas.TrendSummary])
def get_summaries(db: Session = Depends(database.get_db)):
    return db.query(models.TrendSummary).order_by(models.TrendSummary.created_at.desc()).all()

@router.delete("/summaries/{summary_id}")
def delete_summary(summary_id: int, db: Session = Depends(database.get_db)):
    summary = db.query(models.TrendSummary).filter(models.TrendSummary.id == summary_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    
    db.delete(summary)
    db.commit()
    return {"message": "Summary deleted successfully"}
