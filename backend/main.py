from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.routers import feeds, articles, settings, curation, logs
from backend.services import scheduler
from contextlib import asynccontextmanager

# Create tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.start_scheduler()
    yield
    scheduler.shutdown_scheduler()

app = FastAPI(title="Foresight Trend Tool API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(feeds.router)
app.include_router(articles.router)
app.include_router(settings.router)
app.include_router(curation.router)
app.include_router(logs.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Foresight Trend Tool API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
