from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from .. import database, models
from .rss_service import update_feeds
from . import ai_service
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

def get_schedule_interval(db: Session):
    setting = db.query(models.Setting).filter(models.Setting.key == "feed_schedule").first()
    value = setting.value if setting else "hourly"
    
    if value == "daily":
        return {"trigger": "interval", "days": 1}
    elif value == "weekly":
        return {"trigger": "interval", "weeks": 1}
    else: # hourly or default
        return {"trigger": "interval", "hours": 1}

def run_update_feeds():
    db = database.SessionLocal()
    try:
        logger.info("Running scheduled feed update...")
        count = update_feeds(db)
        logger.info(f"Scheduled update complete. New articles: {count}")
    except Exception as e:
        logger.error(f"Error in scheduled feed update: {e}")
    finally:
        db.close()

def run_weekly_reports():
    """
    Generates weekly reports for each active category and industry.
    """
    db = database.SessionLocal()
    try:
        logger.info("Running scheduled weekly report generation...")
        
        # Get all unique categories and industries from recent articles (last 30 days to be safe)
        cutoff = datetime.utcnow() - timedelta(days=30)
        
        # Get categories
        categories = db.query(models.Article.steepv_category).filter(
            models.Article.created_at >= cutoff,
            models.Article.steepv_category.isnot(None)
        ).distinct().all()
        categories = [c[0] for c in categories if c[0]]
        
        # Get industries
        industries = db.query(models.Article.industry).filter(
            models.Article.created_at >= cutoff,
            models.Article.industry.isnot(None)
        ).distinct().all()
        industries = [i[0] for i in industries if i[0]]
        
        report_days = 7
        report_cutoff = datetime.utcnow() - timedelta(days=report_days)
        
        # Generate Category Reports
        for category in categories:
            articles = db.query(models.Article).filter(
                models.Article.created_at >= report_cutoff,
                models.Article.steepv_category == category,
                models.Article.signal_strength.in_(["medium", "strong"])
            ).all()
            
            if len(articles) >= 5: # Minimum articles to justify a report
                logger.info(f"Generating report for category: {category}")
                summary_text = ai_service.generate_trend_summary(articles, db, category=category)
                
                summary = models.TrendSummary(
                    title=f"Weekly {category} Trends - {datetime.utcnow().strftime('%Y-%m-%d')}",
                    content=summary_text,
                    start_date=report_cutoff,
                    end_date=datetime.utcnow(),
                    is_published=True
                )
                db.add(summary)
                db.commit()
        
        # Generate Industry Reports
        for industry in industries:
            articles = db.query(models.Article).filter(
                models.Article.created_at >= report_cutoff,
                models.Article.industry == industry,
                models.Article.signal_strength.in_(["medium", "strong"])
            ).all()
            
            if len(articles) >= 5:
                logger.info(f"Generating report for industry: {industry}")
                summary_text = ai_service.generate_trend_summary(articles, db, industry=industry)
                
                summary = models.TrendSummary(
                    title=f"Weekly {industry} Outlook - {datetime.utcnow().strftime('%Y-%m-%d')}",
                    content=summary_text,
                    start_date=report_cutoff,
                    end_date=datetime.utcnow(),
                    is_published=True
                )
                db.add(summary)
                db.commit()
                
        logger.info("Weekly report generation complete.")
        
    except Exception as e:
        logger.error(f"Error in weekly report generation: {e}")
    finally:
        db.close()

def start_scheduler():
    # Create a new session to fetch settings
    db = database.SessionLocal()
    try:
        trigger_args = get_schedule_interval(db)
        logger.info(f"Starting scheduler with config: {trigger_args}")
    finally:
        db.close()

    # Feed Update Job
    scheduler.add_job(
        func=run_update_feeds, 
        id="update_feeds_job",
        replace_existing=True,
        **trigger_args
    )
    
    # Weekly Report Job (Every Monday at 9 AM)
    scheduler.add_job(
        func=run_weekly_reports,
        id="weekly_reports_job",
        replace_existing=True,
        trigger="cron",
        day_of_week="mon",
        hour=9,
        minute=0
    )
    
    scheduler.start()

def shutdown_scheduler():
    scheduler.shutdown()
