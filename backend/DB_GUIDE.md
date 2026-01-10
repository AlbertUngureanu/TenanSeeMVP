# Database Usage Guide

This guide explains how to work with the database in the IAS Rental Platform backend.

## Database Type

The application uses **SQLite** by default, which stores data in a single file: `ias_rental.db`

## Database Location

The database file is created in the `backend/` directory when you first run the application.

## Ways to Access the Database

### 1. Using Python/SQLAlchemy (Recommended)

The backend uses SQLAlchemy ORM for database operations. You can use the utility functions:

```python
from app.db_utils import get_all_users, get_all_properties, get_database_stats

# Get all users
users = get_all_users()
for user in users:
    print(user.name, user.email)

# Get all properties
properties = get_all_properties()
for prop in properties:
    print(prop.title, prop.location)

# Get statistics
stats = get_database_stats()
print(stats)
```

### 2. Using the Database Utility Script

Run the utility script to see database information:

```bash
python -m app.db_utils
```

This will print:
- Total number of users and properties
- List of all users
- List of all properties

### 3. Using SQLite Command Line

You can use SQLite's command-line tool directly:

```bash
# Open the database
sqlite3 ias_rental.db

# Then run SQL commands:
.tables                    # List all tables
.schema                    # Show database schema
SELECT * FROM users;       # View all users
SELECT * FROM properties; # View all properties
.quit                      # Exit
```

### 4. Using SQLite Browser Tools (GUI)

Install a SQLite browser for a visual interface:

**DB Browser for SQLite** (Free, Cross-platform):
- Download: https://sqlitebrowser.org/
- Open `ias_rental.db` file
- Browse tables, run queries, edit data visually

**Other options:**
- **SQLiteStudio**: https://sqlitestudio.pl/
- **DBeaver**: https://dbeaver.io/ (Supports multiple databases)

## Common Database Operations

### View All Data

```python
from app.db_utils import print_database_info
print_database_info()
```

### Query Specific Data

```python
from app.db_utils import get_user_by_email, get_properties_by_location

# Get user by email
user = get_user_by_email("ion.popescu@example.com")
print(user.name)

# Get properties in a location
properties = get_properties_by_location("București")
for prop in properties:
    print(prop.title)
```

### Direct SQLAlchemy Queries

```python
from app.database import SessionLocal
from app.models import User, Property

db = SessionLocal()

# Get all verified users
verified_users = db.query(User).filter(User.is_verified == True).all()

# Get properties with price less than 1000
cheap_properties = db.query(Property).filter(Property.price < 1000).all()

# Get properties by type
rent_properties = db.query(Property).filter(Property.type == "rent").all()

db.close()
```

### Update Data

```python
from app.database import SessionLocal
from app.models import User

db = SessionLocal()

# Get user
user = db.query(User).filter(User.email == "test@example.com").first()

# Update
if user:
    user.name = "New Name"
    user.is_verified = True
    db.commit()

db.close()
```

### Delete Data

```python
from app.database import SessionLocal
from app.models import Property

db = SessionLocal()

# Delete a property
property = db.query(Property).filter(Property.id == 1).first()
if property:
    db.delete(property)
    db.commit()

db.close()
```

## Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `hashed_password` - Encrypted password
- `is_verified` - Verification status
- `account_created_year` - Year account was created
- `profile_description` - User profile description
- `profile_image` - Profile image URL
- `created_at` - Timestamp

### Properties Table
- `id` - Primary key
- `title` - Property title
- `description` - Property description
- `address` - Full address
- `location` - City/location
- `price` - Price value
- `price_currency` - Currency (RON, EUR, etc.)
- `price_period` - Period (lună, one-time)
- `type` - Type (rent or sale)
- `rooms` - Number of rooms
- `bathrooms` - Number of bathrooms
- `surface` - Surface area in square meters
- `owner_id` - Foreign key to users table
- `is_verified` - Verification status
- `created_at` - Timestamp

### Property Images Table
- `id` - Primary key
- `property_id` - Foreign key to properties table
- `image_url` - Image URL
- `is_primary` - Whether this is the primary image
- `order` - Display order

## Database Management Commands

### Clear All Data
```bash
python -m app.clear_data
```

### Seed Sample Data
```bash
python -m app.seed_data
```

### View Database Info
```bash
python -m app.db_utils
```

### Delete Database File (Complete Reset)
```bash
# Windows
del ias_rental.db

# macOS/Linux
rm ias_rental.db
```

## Switching to PostgreSQL

If you want to use PostgreSQL instead of SQLite:

1. Install PostgreSQL and create a database
2. Update `.env` file:
   ```
   DATABASE_URL=postgresql://user:password@localhost/ias_rental
   ```
3. Install PostgreSQL driver:
   ```bash
   pip install psycopg2-binary
   ```
4. The application will automatically use PostgreSQL

## Tips

- Always close database sessions when done
- Use transactions for multiple operations
- Use the utility functions in `db_utils.py` for common operations
- Use SQLite browser tools for visual inspection
- Backup the database file before major changes

