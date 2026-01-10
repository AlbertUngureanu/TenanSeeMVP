from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta
from app.database import get_db
from app import models, schemas
from app.utils.auth import decode_access_token

router = APIRouter()


def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Get current authenticated user from token"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autentificare lipsă"
        )
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Format token invalid"
        )
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalid sau expirat"
        )
    
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalid"
        )
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilizatorul nu a fost găsit sau contul este dezactivat"
        )
    
    return user


@router.get("/available/{property_id}")
def get_available_slots(
    property_id: int,
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    db: Session = Depends(get_db)
):
    """Get available time slots for a property on a specific date"""
    # Verify property exists
    property = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proprietatea nu a fost găsită"
        )
    
    # Get all booked slots for this property and date
    booked_visits = db.query(models.Visit).filter(
        models.Visit.property_id == property_id,
        models.Visit.visit_date == date,
        models.Visit.status == "scheduled"
    ).all()
    
    booked_times = {visit.visit_time for visit in booked_visits}
    
    # Define available time slots (9:00 AM to 4:00 PM, 30-minute intervals)
    all_slots = []
    for hour in range(9, 16):  # 9 AM to 3:30 PM
        for minute in [0, 30]:
            time_str = f"{hour:02d}:{minute:02d}"
            all_slots.append({
                "time": time_str,
                "available": time_str not in booked_times
            })
    
    return {
        "property_id": property_id,
        "date": date,
        "slots": all_slots
    }


@router.post("", response_model=schemas.VisitResponse)
def create_visit(
    visit_data: schemas.VisitCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Schedule a visit to a property"""
    # Verify property exists
    property = db.query(models.Property).filter(models.Property.id == visit_data.property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proprietatea nu a fost găsită"
        )
    
    # Check if slot is already booked
    existing_visit = db.query(models.Visit).filter(
        models.Visit.property_id == visit_data.property_id,
        models.Visit.visit_date == visit_data.visit_date,
        models.Visit.visit_time == visit_data.visit_time,
        models.Visit.status == "scheduled"
    ).first()
    
    if existing_visit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Acest interval orar este deja rezervat"
        )
    
    # Create visit
    new_visit = models.Visit(
        property_id=visit_data.property_id,
        buyer_id=current_user.id,
        visit_date=visit_data.visit_date,
        visit_time=visit_data.visit_time,
        status="scheduled",
        notes=visit_data.notes
    )
    
    db.add(new_visit)
    db.commit()
    db.refresh(new_visit)
    
    # Load property and buyer for response
    db.refresh(property)
    db.refresh(new_visit)
    
    # Get property and buyer info for response
    property = db.query(models.Property).filter(models.Property.id == new_visit.property_id).first()
    buyer = db.query(models.User).filter(models.User.id == new_visit.buyer_id).first()
    
    visit_dict = {
        "id": new_visit.id,
        "property_id": new_visit.property_id,
        "buyer_id": new_visit.buyer_id,
        "visit_date": new_visit.visit_date,
        "visit_time": new_visit.visit_time,
        "status": new_visit.status,
        "notes": new_visit.notes,
        "created_at": new_visit.created_at,
        "property_title": property.title if property else None,
        "buyer_name": buyer.name if buyer else None,
        "property_address": property.address if property else None
    }
    
    return schemas.VisitResponse(**visit_dict)


@router.get("/my-visits", response_model=List[schemas.VisitResponse])
def get_my_visits(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get visits for the current user (as buyer or owner)"""
    if current_user.role == "buyer":
        # Get visits where user is the buyer
        visits = db.query(models.Visit).filter(
            models.Visit.buyer_id == current_user.id,
            models.Visit.status == "scheduled"
        ).order_by(models.Visit.visit_date, models.Visit.visit_time).all()
    else:
        # Get visits for properties owned by the user
        visits = db.query(models.Visit).join(models.Property).filter(
            models.Property.owner_id == current_user.id,
            models.Visit.status == "scheduled"
        ).order_by(models.Visit.visit_date, models.Visit.visit_time).all()
    
    # Build response with property and buyer info
    result = []
    for visit in visits:
        property = db.query(models.Property).filter(models.Property.id == visit.property_id).first()
        buyer = db.query(models.User).filter(models.User.id == visit.buyer_id).first()
        
        visit_dict = {
            "id": visit.id,
            "property_id": visit.property_id,
            "buyer_id": visit.buyer_id,
            "owner_id": property.owner_id if property else None,
            "visit_date": visit.visit_date,
            "visit_time": visit.visit_time,
            "status": visit.status,
            "notes": visit.notes,
            "created_at": visit.created_at,
            "property_title": property.title if property else None,
            "buyer_name": buyer.name if buyer else None,
            "property_address": property.address if property else None
        }
        result.append(schemas.VisitResponse(**visit_dict))
    
    return result


@router.delete("/{visit_id}")
def cancel_visit(
    visit_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel a scheduled visit"""
    visit = db.query(models.Visit).filter(models.Visit.id == visit_id).first()
    
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vizita nu a fost găsită"
        )
    
    # Check if user has permission (buyer who scheduled it, or owner of the property)
    if current_user.role == "buyer" and visit.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nu aveți permisiunea să anulați această vizită"
        )
    
    if current_user.role == "owner":
        property = db.query(models.Property).filter(models.Property.id == visit.property_id).first()
        if not property or property.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Nu aveți permisiunea să anulați această vizită"
            )
    
    visit.status = "cancelled"
    db.commit()
    
    return {"success": True, "message": "Vizita a fost anulată"}

