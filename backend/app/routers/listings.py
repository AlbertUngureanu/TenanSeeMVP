from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.get("", response_model=schemas.PropertyListResponse)
def get_listings(
    search: Optional[str] = Query(None, description="Search term for location or description"),
    price: Optional[str] = Query(None, description="Price filter (e.g., '0-500', '500-1000')"),
    forSale: Optional[bool] = Query(None),
    forRent: Optional[bool] = Query(None),
    twoPlusRooms: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """Get property listings with optional filters"""
    query = db.query(models.Property)
    
    # Apply type filter
    if forSale and not forRent:
        query = query.filter(models.Property.type == "sale")
    elif forRent and not forSale:
        query = query.filter(models.Property.type == "rent")
    
    # Apply room filter
    if twoPlusRooms:
        query = query.filter(models.Property.rooms >= 2)
    
    # Apply search filter
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            (models.Property.location.ilike(search_term)) |
            (models.Property.description.ilike(search_term)) |
            (models.Property.address.ilike(search_term))
        )
    
    # Apply price filter
    if price:
        if price == "0-500":
            query = query.filter(models.Property.price <= 500)
        elif price == "500-1000":
            query = query.filter(models.Property.price >= 500, models.Property.price <= 1000)
        elif price == "1000-2000":
            query = query.filter(models.Property.price >= 1000, models.Property.price <= 2000)
        elif price == "2000+":
            query = query.filter(models.Property.price >= 2000)
    
    properties = query.all()
    
    # Format listings for response
    listings = []
    for prop in properties:
        # Get primary image if available
        primary_image = next((img.image_url for img in prop.images if img.is_primary), None)
        
        # Format price
        if prop.type == "rent":
            price_str = f"{int(prop.price)} {prop.price_currency}/{prop.price_period}"
        else:
            price_str = f"{int(prop.price)} {prop.price_currency}"
        
        listings.append(schemas.PropertyListItem(
            id=prop.id,
            price=price_str,
            description=prop.description,
            image=primary_image,
            location=prop.location,
            rooms=prop.rooms,
            type=prop.type
        ))
    
    return {
        "listings": listings,
        "total": len(listings)
    }

