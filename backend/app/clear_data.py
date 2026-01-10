"""
Script to clear all data from the database
Usage: python -m app.clear_data
"""
from app.database import SessionLocal, engine
from app.models import Base, User, Property, PropertyImage, Visit, Review

db = SessionLocal()

try:
    print("🗑️  Clearing all data from database...")
    
    # Delete in correct order to respect foreign key constraints
    db.query(Review).delete()
    print("   ✓ Deleted all reviews")
    
    db.query(PropertyImage).delete()
    print("   ✓ Deleted all property images")
    
    db.query(Visit).delete()
    print("   ✓ Deleted all visits")
    
    db.query(Property).delete()
    print("   ✓ Deleted all properties")
    
    db.query(User).delete()
    print("   ✓ Deleted all users")
    
    db.commit()
    
    print("\n✅ All data cleared successfully!")
    print("   Database is now empty and ready for new data.")
    
except Exception as e:
    print(f"❌ Error clearing data: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()

