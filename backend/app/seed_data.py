"""
Script to seed initial data into the database
Run this after setting up the database to populate it with sample data

Usage: python -m app.seed_data
"""
from app.database import SessionLocal, engine
from app.models import Base, User, Property, PropertyImage
from app.utils.auth import get_password_hash
from datetime import datetime

# Create tables (this will create new tables or update existing ones)
# Note: For adding columns to existing tables, use migrate_db.py
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Check if data already exists
    existing_properties = db.query(Property).count()
    if existing_properties > 0:
        print("⚠️  Database already contains data. Skipping seed.")
        db.close()
        exit(0)
    
    # Create sample users
    user1 = User(
        name="Ion Popescu",
        email="ion.popescu@example.com",
        hashed_password="password123",
        role="owner",
        is_verified=True,
        account_created_year=2020,
        profile_description="Proprietar cu experiență de peste 10 ani în domeniul imobiliar."
    )
    
    user2 = User(
        name="Maria Ionescu",
        email="maria.ionescu@example.com",
        hashed_password="password123",
        role="buyer",
        is_verified=True,
        account_created_year=2019,
        profile_description="Specializată în proprietăți de coastă și locuințe premium."
    )
    
    user3 = User(
        name="Andrei Marin",
        email="andrei.marin@example.com",
        hashed_password="password123",
        role="buyer",
        is_verified=True,
        account_created_year=2020,
        profile_description="Specializat în proprietăți de coastă, oferim locuințe cu vedere la mare și acces la facilități turistice."
    )
    
    user4 = User(
        name="Alexandra Popescu",
        email="alexandra.popescu@example.com",
        hashed_password="password123",
        role="owner",
        is_verified=True,
        account_created_year=2020,
        profile_description="Specializată în proprietăți de coastă și locuințe premium."
    )

    db.add(user1)
    db.add(user2)
    db.add(user3)
    db.add(user4)
    db.commit()
    db.refresh(user1)
    db.refresh(user2)
    db.refresh(user3)
    db.refresh(user4)
    
    # Create sample properties
    properties_data = [
        {
            "title": "Apartament modern cu 8 camere",
            "description": "Apartament modern cu 8 camere în centrul orașului, mobilat complet, cu vedere la parcul central.",
            "address": "Strada Calea Victoriei nr. 10, Sector 1, București",
            "location": "București",
            "price": 1200,
            "price_currency": "RON",
            "price_period": "lună",
            "type": "rent",
            "rooms": 2,
            "bathrooms": 1,
            "surface": 65,
            "owner_id": user1.id,
            "is_verified": True
        },
        {
            "title": "Apartament confortabil cu 1 cameră",
            "description": "Apartament confortabil cu 1 cameră, mobilat complet, ideal pentru studenți sau tineri profesioniști.",
            "address": "Bulevardul Eroilor nr. 25, Sector 2, București",
            "location": "București",
            "price": 850,
            "price_currency": "RON",
            "price_period": "lună",
            "type": "rent",
            "rooms": 1,
            "bathrooms": 1,
            "surface": 45,
            "owner_id": user1.id,
            "is_verified": True
        },
        {
            "title": "Apartament spațios cu 3 camere",
            "description": "Apartament spațios cu 3 camere, balcon mare, parcare inclusă, situat într-o zonă rezidențială liniștită.",
            "address": "Strada Libertății nr. 50, Sector 3, București",
            "location": "București",
            "price": 1500,
            "price_currency": "RON",
            "price_period": "lună",
            "type": "rent",
            "rooms": 3,
            "bathrooms": 2,
            "surface": 95,
            "owner_id": user4.id,
            "is_verified": True
        },
        {
            "title": "Casa cu 4 camere, curte mare",
            "description": "Casa cu 4 camere, curte mare, garaj, situată într-o zonă exclusivă, ideală pentru familii.",
            "address": "Strada Măgurii nr. 15, Sector 4, București",
            "location": "București",
            "price": 95000,
            "price_currency": "EUR",
            "price_period": "one-time",
            "type": "sale",
            "rooms": 4,
            "bathrooms": 3,
            "surface": 180,
            "owner_id": user1.id,
            "is_verified": True
        },
        {
            "title": "Apartament nou cu 2 camere",
            "description": "Apartament nou cu 2 camere, parter, cu acces la curte comună, într-un bloc nou construit.",
            "address": "Strada Unirii nr. 30, Sector 5, București",
            "location": "București",
            "price": 1100,
            "price_currency": "RON",
            "price_period": "lună",
            "type": "rent",
            "rooms": 2,
            "bathrooms": 1,
            "surface": 62,
            "owner_id": user4.id,
            "is_verified": True
        },
        {
            "title": "Apartament renovat cu 2 camere",
            "description": "Apartament recent renovat, situat la etajul 3. Beneficiază de balcon mare, lumină naturală abundentă și acces la parcul central la doar 5 minute de mers pe jos.",
            "address": "Bulevardul Magheru nr. 100, Sector 6, București",
            "location": "București",
            "price": 1350,
            "price_currency": "RON",
            "price_period": "lună",
            "type": "rent",
            "rooms": 2,
            "bathrooms": 1,
            "surface": 62,
            "owner_id": user4.id,
            "is_verified": True
        }
    ]
    
    for prop_data in properties_data:
        prop = Property(**prop_data)
        db.add(prop)
    
    db.commit()
    
    print("✅ Sample data seeded successfully!")
    print(f"   - Created {len(properties_data)} properties")
    print(f"   - Created 3 users")
    print("\n📝 Test credentials:")
    print("   Email: ion.popescu@example.com")
    print("   Password: password123")
    
except Exception as e:
    print(f"❌ Error seeding data: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
