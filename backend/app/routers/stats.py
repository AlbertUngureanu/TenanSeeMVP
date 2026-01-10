from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.get("", response_model=schemas.StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    """Get platform statistics"""
    total_listings = db.query(func.count(models.Property.id)).scalar() or 0
    verified_landlords = db.query(func.count(models.User.id)).filter(
        models.User.is_verified == True
    ).scalar() or 0
    active_users = db.query(func.count(models.User.id)).scalar() or 0
    
    return {
        "totalListings": total_listings,
        "verifiedLandlords": verified_landlords,
        "activeUsers": active_users
    }

