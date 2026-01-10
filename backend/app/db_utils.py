"""
Database utility functions for direct database access
Usage examples:
    from app.db_utils import get_all_users, get_all_properties, get_user_by_email
    
    users = get_all_users()
    properties = get_all_properties()
"""
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, Property, PropertyImage


def get_db_session():
    """Get a database session"""
    return SessionLocal()


# User operations
def get_all_users():
    """Get all users from the database"""
    db = SessionLocal()
    try:
        return db.query(User).all()
    finally:
        db.close()


def get_user_by_id(user_id: int):
    """Get a user by ID"""
    db = SessionLocal()
    try:
        return db.query(User).filter(User.id == user_id).first()
    finally:
        db.close()


def get_user_by_email(email: str):
    """Get a user by email"""
    db = SessionLocal()
    try:
        return db.query(User).filter(User.email == email).first()
    finally:
        db.close()


# Property operations
def get_all_properties():
    """Get all properties from the database"""
    db = SessionLocal()
    try:
        return db.query(Property).all()
    finally:
        db.close()


def get_property_by_id(property_id: int):
    """Get a property by ID"""
    db = SessionLocal()
    try:
        return db.query(Property).filter(Property.id == property_id).first()
    finally:
        db.close()


def get_properties_by_owner(owner_id: int):
    """Get all properties owned by a specific user"""
    db = SessionLocal()
    try:
        return db.query(Property).filter(Property.owner_id == owner_id).all()
    finally:
        db.close()


def get_properties_by_location(location: str):
    """Get all properties in a specific location"""
    db = SessionLocal()
    try:
        return db.query(Property).filter(Property.location.ilike(f"%{location}%")).all()
    finally:
        db.close()


def get_properties_by_type(property_type: str):
    """Get all properties of a specific type (rent/sale)"""
    db = SessionLocal()
    try:
        return db.query(Property).filter(Property.type == property_type).all()
    finally:
        db.close()


# Statistics
def get_database_stats():
    """Get database statistics"""
    db = SessionLocal()
    try:
        total_users = db.query(User).count()
        total_properties = db.query(Property).count()
        verified_users = db.query(User).filter(User.is_verified == True).count()
        verified_properties = db.query(Property).filter(Property.is_verified == True).count()
        
        return {
            "total_users": total_users,
            "total_properties": total_properties,
            "verified_users": verified_users,
            "verified_properties": verified_properties
        }
    finally:
        db.close()


# Example usage function
def print_database_info():
    """Print database information"""
    stats = get_database_stats()
    print("📊 Database Statistics:")
    print(f"   Total Users: {stats['total_users']}")
    print(f"   Verified Users: {stats['verified_users']}")
    print(f"   Total Properties: {stats['total_properties']}")
    print(f"   Verified Properties: {stats['verified_properties']}")
    print()
    
    users = get_all_users()
    if users:
        print("👥 Users:")
        for user in users:
            print(f"   - {user.name} ({user.email}) - Verified: {user.is_verified}")
        print()
    
    properties = get_all_properties()
    if properties:
        print("🏠 Properties:")
        for prop in properties:
            print(f"   - {prop.title} - {prop.location} - {prop.type} - {prop.price} {prop.price_currency}")
    else:
        print("   No properties found.")


if __name__ == "__main__":
    # Run this script directly to see database info
    print_database_info()

