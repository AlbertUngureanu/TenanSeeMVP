from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
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


@router.get("/owner/{owner_id}")
def get_owner_properties(owner_id: int, db: Session = Depends(get_db)):
    """Get all properties for a specific owner"""
    # Verify owner exists
    owner = db.query(models.User).filter(models.User.id == owner_id).first()
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proprietarul nu a fost găsit"
        )
    
    # Get all properties for this owner
    properties = db.query(models.Property).filter(
        models.Property.owner_id == owner_id
    ).order_by(models.Property.created_at.desc()).all()
    
    # Build response with images and owner info
    result = []
    for property in properties:
        images = db.query(models.PropertyImage).filter(
            models.PropertyImage.property_id == property.id
        ).order_by(models.PropertyImage.is_primary.desc(), models.PropertyImage.order).all()
        
        # Format price
        if property.type == "rent":
            price_str = f"{int(property.price)} {property.price_currency}/{property.price_period}"
        else:
            price_str = f"{int(property.price)} {property.price_currency}"
        
        property_dict = {
            "id": property.id,
            "title": property.title,
            "description": property.description,
            "price": price_str,
            "property_type": property.property_type if hasattr(property, 'property_type') else property.type,
            "transaction_type": property.transaction_type if hasattr(property, 'transaction_type') else property.type,
            "rooms": property.rooms,
            "bathrooms": property.bathrooms,
            "area": property.area if hasattr(property, 'area') else property.surface,
            "address": property.address,
            "city": property.city if hasattr(property, 'city') else property.location,
            "has_parking": property.has_parking if hasattr(property, 'has_parking') else False,
            "has_elevator": property.has_elevator if hasattr(property, 'has_elevator') else False,
            "has_balcony": property.has_balcony if hasattr(property, 'has_balcony') else False,
            "is_furnished": property.is_furnished if hasattr(property, 'is_furnished') else False,
            "floor": property.floor if hasattr(property, 'floor') else None,
            "year_built": property.year_built if hasattr(property, 'year_built') else None,
            "created_at": property.created_at,
            "images": [{"id": img.id, "url": img.image_url} for img in images],
            "owner": {
                "id": owner.id,
                "name": owner.name,
                "email": owner.email,
                "profile_image": owner.profile_image,
                "account_created_year": owner.account_created_year,
                "profile_description": owner.profile_description
            }
        }
        result.append(property_dict)
    
    return result


@router.get("/{property_id}", response_model=schemas.PropertyDetails)
def get_property_details(property_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a specific property"""
    property = db.query(models.Property).filter(models.Property.id == property_id).first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proprietatea nu a fost găsită"
        )
    
    # Get images
    images = sorted(property.images, key=lambda x: (x.is_primary, x.order), reverse=True)
    image_responses = [schemas.PropertyImageResponse.model_validate(img) for img in images]
    
    # Format monthly cost
    if property.type == "rent":
        monthly_cost = f"{int(property.price)} {property.price_currency}/{property.price_period}"
    else:
        monthly_cost = f"{int(property.price)} {property.price_currency}"
    
    # Get owner info
    owner = property.owner
    
    return schemas.PropertyDetails(
        id=property.id,
        title=property.title,
        description=property.description,
        address=property.address,
        location=property.location,
        price=property.price,
        price_currency=property.price_currency,
        price_period=property.price_period,
        type=property.type,
        rooms=property.rooms,
        bathrooms=property.bathrooms,
        surface=property.surface,
        monthly_cost=monthly_cost,
        images=image_responses,
        owner=schemas.PropertyOwnerResponse.model_validate(owner)
    )


@router.post("", response_model=schemas.PropertyDetails)
def create_property(
    property_data: schemas.PropertyCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new property listing (only for owners)"""
    # Check if user is an owner
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doar proprietarii pot crea anunțuri"
        )
    
    # Validate price_period for sale type
    if property_data.type == "sale" and property_data.price_period != "one-time":
        property_data.price_period = "one-time"
    
    # Create new property
    new_property = models.Property(
        title=property_data.title,
        description=property_data.description,
        address=property_data.address,
        location=property_data.location,
        price=property_data.price,
        price_currency=property_data.price_currency,
        price_period=property_data.price_period,
        type=property_data.type,
        rooms=property_data.rooms,
        bathrooms=property_data.bathrooms,
        surface=property_data.surface,
        owner_id=current_user.id,
        is_verified=current_user.is_verified  # Property verification matches owner verification
    )
    
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    
    # Format response
    if new_property.type == "rent":
        monthly_cost = f"{int(new_property.price)} {new_property.price_currency}/{new_property.price_period}"
    else:
        monthly_cost = f"{int(new_property.price)} {new_property.price_currency}"
    
    return schemas.PropertyDetails(
        id=new_property.id,
        title=new_property.title,
        description=new_property.description,
        address=new_property.address,
        location=new_property.location,
        price=new_property.price,
        price_currency=new_property.price_currency,
        price_period=new_property.price_period,
        type=new_property.type,
        rooms=new_property.rooms,
        bathrooms=new_property.bathrooms,
        surface=new_property.surface,
        monthly_cost=monthly_cost,
        images=[],
        owner=schemas.PropertyOwnerResponse.model_validate(current_user)
    )
