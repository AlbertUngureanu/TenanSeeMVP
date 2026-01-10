from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="buyer")  # "buyer" or "owner"
    is_verified = Column(Boolean, default=False)
    account_created_year = Column(Integer)
    profile_description = Column(Text, nullable=True)
    profile_image = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)  # Stored as string (YYYY-MM-DD format)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    address = Column(String, nullable=False)
    location = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    price_currency = Column(String, default="RON")
    price_period = Column(String, default="lună")  # "lună" for rent, "one-time" for sale
    type = Column(String, nullable=False)  # "rent" or "sale"
    rooms = Column(Integer, nullable=False)
    bathrooms = Column(Integer, nullable=False)
    surface = Column(Float, nullable=False)  # in square meters
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", backref="properties")


class PropertyImage(Base):
    __tablename__ = "property_images"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    image_url = Column(String, nullable=False)
    is_primary = Column(Boolean, default=False)
    order = Column(Integer, default=0)

    property = relationship("Property", backref="images")


class Visit(Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    visit_date = Column(String, nullable=False)  # Format: YYYY-MM-DD
    visit_time = Column(String, nullable=False)  # Format: HH:MM (24-hour)
    status = Column(String, default="scheduled")  # "scheduled", "completed", "cancelled"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    property = relationship("Property", backref="visits")
    buyer = relationship("User", foreign_keys=[buyer_id], backref="scheduled_visits")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    visit_id = Column(Integer, ForeignKey("visits.id"), nullable=True)  # Link to the visit
    rating = Column(Integer, nullable=False)  # 1-5 stars
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", foreign_keys=[owner_id], backref="received_reviews")
    buyer = relationship("User", foreign_keys=[buyer_id], backref="written_reviews")
    property = relationship("Property", backref="reviews")
    visit = relationship("Visit", backref="review")

