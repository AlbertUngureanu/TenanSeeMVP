from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
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


@router.post("", response_model=schemas.ReviewResponse)
def create_review(
    review_data: schemas.ReviewCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a review for an owner (only buyers who visited can review)"""
    # Only buyers can create reviews
    if current_user.role != "buyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doar cumpărătorii pot adăuga recenzii"
        )
    
    # Verify owner exists
    owner = db.query(models.User).filter(models.User.id == review_data.owner_id).first()
    if not owner or owner.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proprietarul nu a fost găsit"
        )
    
    # Verify property exists and belongs to the owner
    property = db.query(models.Property).filter(
        models.Property.id == review_data.property_id,
        models.Property.owner_id == review_data.owner_id
    ).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proprietatea nu a fost găsită sau nu aparține acestui proprietar"
        )
    
    # Verify buyer has visited this property (check if visit exists and is completed)
    if review_data.visit_id:
        visit = db.query(models.Visit).filter(
            models.Visit.id == review_data.visit_id,
            models.Visit.buyer_id == current_user.id,
            models.Visit.property_id == review_data.property_id
        ).first()
        if not visit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vizita specificată nu există sau nu vă aparține"
            )
    else:
        # Check if buyer has any completed visit for this property
        visit = db.query(models.Visit).filter(
            models.Visit.buyer_id == current_user.id,
            models.Visit.property_id == review_data.property_id,
            models.Visit.status.in_(["scheduled", "completed"])
        ).first()
        if not visit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Trebuie să fiți vizitat proprietatea pentru a putea adăuga o recenzie"
            )
        review_data.visit_id = visit.id
    
    # Check if buyer already reviewed this owner for this property
    existing_review = db.query(models.Review).filter(
        models.Review.buyer_id == current_user.id,
        models.Review.owner_id == review_data.owner_id,
        models.Review.property_id == review_data.property_id
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ați adăugat deja o recenzie pentru acest proprietar și această proprietate"
        )
    
    # Validate rating
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating-ul trebuie să fie între 1 și 5 stele"
        )
    
    # Create review
    new_review = models.Review(
        owner_id=review_data.owner_id,
        buyer_id=current_user.id,
        property_id=review_data.property_id,
        visit_id=review_data.visit_id,
        rating=review_data.rating,
        comment=review_data.comment
    )
    
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    # Get buyer info for response
    buyer = db.query(models.User).filter(models.User.id == current_user.id).first()
    
    review_dict = {
        "id": new_review.id,
        "owner_id": new_review.owner_id,
        "buyer_id": new_review.buyer_id,
        "property_id": new_review.property_id,
        "visit_id": new_review.visit_id,
        "rating": new_review.rating,
        "comment": new_review.comment,
        "created_at": new_review.created_at,
        "buyer_name": buyer.name if buyer else None,
        "property_title": property.title if property else None
    }
    
    return schemas.ReviewResponse(**review_dict)


@router.get("/owner/{owner_id}", response_model=schemas.OwnerRatingResponse)
def get_owner_reviews(
    owner_id: int,
    db: Session = Depends(get_db)
):
    """Get all reviews for a specific owner"""
    # Verify owner exists
    owner = db.query(models.User).filter(models.User.id == owner_id).first()
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proprietarul nu a fost găsit"
        )
    
    # Get all reviews for this owner
    reviews = db.query(models.Review).filter(
        models.Review.owner_id == owner_id
    ).order_by(models.Review.created_at.desc()).all()
    
    # Calculate average rating
    if reviews:
        avg_rating = sum(review.rating for review in reviews) / len(reviews)
    else:
        avg_rating = 0.0
    
    # Build response with buyer and property info
    review_responses = []
    for review in reviews:
        buyer = db.query(models.User).filter(models.User.id == review.buyer_id).first()
        property = db.query(models.Property).filter(models.Property.id == review.property_id).first()
        
        review_dict = {
            "id": review.id,
            "owner_id": review.owner_id,
            "buyer_id": review.buyer_id,
            "property_id": review.property_id,
            "visit_id": review.visit_id,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at,
            "buyer_name": buyer.name if buyer else None,
            "property_title": property.title if property else None
        }
        review_responses.append(schemas.ReviewResponse(**review_dict))
    
    return {
        "owner_id": owner_id,
        "average_rating": round(avg_rating, 1),
        "total_reviews": len(reviews),
        "reviews": review_responses
    }


@router.get("/property/{property_id}", response_model=List[schemas.ReviewResponse])
def get_property_reviews(
    property_id: int,
    db: Session = Depends(get_db)
):
    """Get all reviews for a specific property"""
    # Verify property exists
    property = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proprietatea nu a fost găsită"
        )
    
    # Get all reviews for this property
    reviews = db.query(models.Review).filter(
        models.Review.property_id == property_id
    ).order_by(models.Review.created_at.desc()).all()
    
    # Build response
    review_responses = []
    for review in reviews:
        buyer = db.query(models.User).filter(models.User.id == review.buyer_id).first()
        
        review_dict = {
            "id": review.id,
            "owner_id": review.owner_id,
            "buyer_id": review.buyer_id,
            "property_id": review.property_id,
            "visit_id": review.visit_id,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at,
            "buyer_name": buyer.name if buyer else None,
            "property_title": property.title if property else None
        }
        review_responses.append(schemas.ReviewResponse(**review_dict))
    
    return review_responses
