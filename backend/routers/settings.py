from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend import models, schemas, database

router = APIRouter(
    prefix="/settings",
    tags=["settings"],
)

@router.get("/{key}", response_model=schemas.Setting)
def read_setting(key: str, db: Session = Depends(database.get_db)):
    setting = db.query(models.Setting).filter(models.Setting.key == key).first()
    if setting is None:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting

@router.post("/", response_model=schemas.Setting)
def create_or_update_setting(setting: schemas.Setting, db: Session = Depends(database.get_db)):
    db_setting = db.query(models.Setting).filter(models.Setting.key == setting.key).first()
    if db_setting:
        db_setting.value = setting.value
    else:
        db_setting = models.Setting(key=setting.key, value=setting.value)
        db.add(db_setting)
    
    db.commit()
    db.refresh(db_setting)
    return db_setting
