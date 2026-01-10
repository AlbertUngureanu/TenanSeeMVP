from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    role: str
    is_verified: bool
    account_created_year: Optional[int]
    profile_description: Optional[str]
    profile_image: Optional[str]

    class Config:
        from_attributes = True


class UserProfileResponse(UserBase):
    id: int
    role: str
    is_verified: bool
    account_created_year: Optional[int]
    profile_description: Optional[str]
    profile_image: Optional[str]
    phone: Optional[str]
    date_of_birth: Optional[str]

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    description: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# Auth Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    token: str
    user: UserResponse


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "buyer"


class RegisterResponse(BaseModel):
    success: bool
    message: str
    user: UserResponse


# Property Schemas
class PropertyImageResponse(BaseModel):
    id: int
    image_url: str
    is_primary: bool
    order: int

    class Config:
        from_attributes = True


class PropertyOwnerResponse(BaseModel):
    id: int
    name: str
    account_created_year: Optional[int]
    profile_description: Optional[str]
    profile_image: Optional[str]

    class Config:
        from_attributes = True


class PropertyBase(BaseModel):
    title: str
    description: str
    address: str
    location: str
    price: float
    price_currency: str = "RON"
    price_period: str = "lună"
    type: str  # "rent" or "sale"
    rooms: int
    bathrooms: int
    surface: float


class PropertyCreate(PropertyBase):
    # owner_id is set automatically from the authenticated user, not from request
    pass


class PropertyListItem(BaseModel):
    id: int
    price: str
    description: str
    image: Optional[str]
    location: str
    rooms: int
    type: str

    class Config:
        from_attributes = True


class PropertyDetails(PropertyBase):
    id: int
    monthly_cost: str
    images: List[PropertyImageResponse]
    owner: PropertyOwnerResponse

    class Config:
        from_attributes = True


class PropertyListResponse(BaseModel):
    listings: List[PropertyListItem]
    total: int


# Stats Schema
class StatsResponse(BaseModel):
    totalListings: int
    verifiedLandlords: int
    activeUsers: int


# Visit Schemas
class VisitCreate(BaseModel):
    property_id: int
    visit_date: str  # YYYY-MM-DD
    visit_time: str  # HH:MM
    notes: Optional[str] = None


class VisitResponse(BaseModel):
    id: int
    property_id: int
    buyer_id: int
    owner_id: Optional[int] = None
    visit_date: str
    visit_time: str
    status: str
    notes: Optional[str]
    created_at: datetime
    property_title: Optional[str] = None
    buyer_name: Optional[str] = None
    property_address: Optional[str] = None

    class Config:
        from_attributes = True


# Review Schemas
class ReviewCreate(BaseModel):
    owner_id: int
    property_id: int
    visit_id: Optional[int] = None
    rating: int  # 1-5
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    owner_id: int
    buyer_id: int
    property_id: int
    visit_id: Optional[int]
    rating: int
    comment: Optional[str]
    created_at: datetime
    buyer_name: Optional[str] = None
    property_title: Optional[str] = None

    class Config:
        from_attributes = True


class OwnerRatingResponse(BaseModel):
    owner_id: int
    average_rating: float
    total_reviews: int
    reviews: List[ReviewResponse]

