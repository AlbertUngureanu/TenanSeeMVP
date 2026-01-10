"""
Script to update a specific property in the database
Usage: python -m app.update_property
"""
from app.database import SessionLocal
from app.models import Property

db = SessionLocal()

try:
    # Find the property with price 1200 (the one with 69 rooms in title)
    property = db.query(Property).filter(Property.price == 1200).first()
    
    if property:
        print(f"Found property: {property.title}")
        print(f"Current description: {property.description}")
        print(f"Current rooms: {property.rooms}")
        
        # Update description to match the title
        property.description = property.description.replace("2 camere", "69 camere")
        property.rooms = 69  # Also update the rooms field
        
        db.commit()
        print(f"\n✅ Updated property:")
        print(f"   New description: {property.description}")
        print(f"   New rooms: {property.rooms}")
    else:
        print("❌ Property with price 1200 not found")
        
except Exception as e:
    print(f"❌ Error updating property: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()

