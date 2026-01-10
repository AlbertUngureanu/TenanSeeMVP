from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.utils.auth import verify_password, get_password_hash, create_access_token
from datetime import datetime

router = APIRouter()


@router.post("/login", response_model=schemas.LoginResponse)
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return access token"""
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email sau parolă incorectă"
        )
    
    token = create_access_token(data={"sub": user.email, "user_id": user.id})
    
    return {
        "token": token,
        "user": schemas.UserResponse.model_validate(user)
    }


@router.post("/register", response_model=schemas.RegisterResponse)
def register(user_data: schemas.RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un cont cu acest email există deja"
        )
    
    # Validate password
    if len(user_data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parola trebuie să aibă cel puțin 6 caractere"
        )
    
    # Validate role
    if user_data.role not in ["buyer", "owner"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rol invalid. Trebuie să fie 'buyer' sau 'owner'"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)[:72]
    current_year = datetime.now().year
    
    new_user = models.User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password,
        role=user_data.role or "buyer",
        account_created_year=current_year,
        is_verified=False
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "success": True,
        "message": "Cont creat cu succes",
        "user": schemas.UserResponse.model_validate(new_user)
    }

