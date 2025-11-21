import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

def seed_feeds():
    db = SessionLocal()
    
    feeds = [
        # Signals Adjacentes
        {"name": "World Economic Forum", "url": "https://www.weforum.org/agenda/feed", "category": "Signals Adjacentes"},
        {"name": "OECD RSS", "url": "https://www.oecd.org/rss/", "category": "Signals Adjacentes"},
        {"name": "Springwise", "url": "https://www.springwise.com/features/updates/feed", "category": "Signals Adjacentes"},
        {"name": "arXiv CS", "url": "https://rss.arxiv.org/rss/cs", "category": "Signals Adjacentes"},
        
        # Artificial Intelligence
        {"name": "MIT Technology Review", "url": "https://www.technologyreview.com/feed/", "category": "Artificial Intelligence"},
        {"name": "HuggingFace Blog", "url": "https://huggingface.co/blog/rss.xml", "category": "Artificial Intelligence"},
        {"name": "Google AI Blog", "url": "https://ai.googleblog.com/feeds/posts/default", "category": "Artificial Intelligence"},
        
        # AR/VR
        {"name": "Road to VR", "url": "https://www.roadtovr.com/feed/", "category": "AR/VR"},
        {"name": "XR Today", "url": "https://www.xrtoday.com/feed/", "category": "AR/VR"},
        {"name": "ARPost", "url": "https://arpost.co/feed/", "category": "AR/VR"},
        
        # Automation
        {"name": "Automation.com", "url": "https://www.automation.com/rss", "category": "Automation"},
        {"name": "UiPath Blog", "url": "https://www.uipath.com/blog/rss.xml", "category": "Automation"},
        
        # Fintech
        {"name": "Finextra", "url": "https://www.finextra.com/rss/news.aspx", "category": "Fintech"},
        {"name": "The Financial Brand", "url": "https://thefinancialbrand.com/feed", "category": "Fintech"},
        {"name": "Payments Dive", "url": "https://www.paymentsdive.com/rss/", "category": "Fintech"},
        {"name": "iupana", "url": "https://iupana.com/feed/", "category": "Fintech"},
        {"name": "Ambito Financiero Fintech", "url": "https://www.ambito.com/rss/fintech.xml", "category": "Fintech"},
        
        # HealthTech
        {"name": "MobiHealthNews", "url": "https://www.mobihealthnews.com/rss.xml", "category": "HealthTech"},
        {"name": "Nature npj Digital Medicine", "url": "https://www.nature.com/npjdigitalmed.rss", "category": "HealthTech"},
        {"name": "FDA Newsroom", "url": "https://www.fda.gov/news-events/fda-newsroom/rss.xml", "category": "HealthTech"},
        
        # Robotics
        {"name": "The Robot Report", "url": "https://www.therobotreport.com/feed/", "category": "Robotics"},
        {"name": "IEEE Spectrum Robotics", "url": "https://spectrum.ieee.org/rss/robotics/fulltext", "category": "Robotics"},
        
        # Web3
        {"name": "CoinDesk", "url": "https://www.coindesk.com/arc/outboundfeeds/rss/", "category": "Web3"},
        {"name": "Decrypt", "url": "https://decrypt.co/feed", "category": "Web3"},
        {"name": "The Defiant", "url": "https://thedefiant.io/feed", "category": "Web3"},
    ]

    print(f"Seeding {len(feeds)} feeds...")
    
    added_count = 0
    for feed_data in feeds:
        existing = db.query(models.Feed).filter(models.Feed.url == feed_data["url"]).first()
        if not existing:
            feed = models.Feed(
                name=feed_data["name"],
                url=feed_data["url"],
                category=feed_data["category"],
                active=True
            )
            db.add(feed)
            added_count += 1
            print(f"Added: {feed_data['name']}")
        else:
            print(f"Skipped (exists): {feed_data['name']}")
            
    db.commit()
    db.close()
    print(f"Seeding complete. Added {added_count} new feeds.")

if __name__ == "__main__":
    seed_feeds()
