import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from database import engine, Base
import models

# Create all tables
Base.metadata.create_all(bind=engine)
print("Database tables created successfully!")
