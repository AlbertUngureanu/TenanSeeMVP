from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app import models, schemas
from app.utils.auth import get_password_hash, verify_password, decode_access_token

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
    
    # Extract token from "Bearer <token>" format
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Format token invalid. Folosiți: Bearer <token>"
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


@router.get("", response_model=schemas.UserProfileResponse)
def get_profile(current_user: models.User = Depends(get_current_user)):
    """Get current user's profile"""
    return schemas.UserProfileResponse.model_validate(current_user)


@router.put("", response_model=schemas.UserProfileResponse)
def update_profile(
    profile_data: schemas.ProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    # Update user fields
    if profile_data.name:
        current_user.name = profile_data.name
    if profile_data.phone is not None:
        current_user.phone = profile_data.phone
    if profile_data.date_of_birth is not None:
        current_user.date_of_birth = profile_data.date_of_birth
    if profile_data.description is not None:
        current_user.profile_description = profile_data.description
    
    db.commit()
    db.refresh(current_user)
    
    return schemas.UserProfileResponse.model_validate(current_user)


@router.post("/change-password")
def change_password(
    password_data: schemas.ChangePasswordRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user's password"""
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parola curentă este incorectă"
        )
    
    # Validate new password
    if len(password_data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parola trebuie să aibă cel puțin 6 caractere"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"success": True, "message": "Parola a fost schimbată cu succes"}


@router.post("/deactivate")
def deactivate_account(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deactivate user account"""
    current_user.is_active = False
    db.commit()
    
    return {"success": True, "message": "Contul a fost dezactivat"}


@router.get("/me")
def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    """Get current user info (simplified)"""
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "is_verified": current_user.is_verified,
        "account_created_year": current_user.account_created_year,
        "profile_description": current_user.profile_description,
        "profile_image": current_user.profile_image
    }

