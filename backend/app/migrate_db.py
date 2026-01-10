"""
Database migration script to add new columns
Run this to update existing database schema
Usage: python -m app.migrate_db
"""
import sqlite3
import os
from pathlib import Path

# Get database path
db_path = Path(__file__).parent.parent / "ias_rental.db"

if not db_path.exists():
    print("❌ Database file not found. It will be created automatically when you run the server.")
    exit(1)

print(f"🔄 Migrating database: {db_path}")

conn = sqlite3.connect(str(db_path))
cursor = conn.cursor()

try:
    migrations_applied = []
    
    # Check if visits table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='visits'")
    visits_table_exists = cursor.fetchone() is not None
    
    if not visits_table_exists:
        print("   Creating 'visits' table...")
        cursor.execute("""
            CREATE TABLE visits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                property_id INTEGER NOT NULL,
                buyer_id INTEGER NOT NULL,
                visit_date TEXT NOT NULL,
                visit_time TEXT NOT NULL,
                status TEXT DEFAULT 'scheduled',
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (property_id) REFERENCES properties(id),
                FOREIGN KEY (buyer_id) REFERENCES users(id)
            )
        """)
        migrations_applied.append("Created 'visits' table")
    
    # Check if reviews table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='reviews'")
    reviews_table_exists = cursor.fetchone() is not None
    
    if not reviews_table_exists:
        print("   Creating 'reviews' table...")
        cursor.execute("""
            CREATE TABLE reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner_id INTEGER NOT NULL,
                buyer_id INTEGER NOT NULL,
                property_id INTEGER NOT NULL,
                visit_id INTEGER,
                rating INTEGER NOT NULL,
                comment TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_id) REFERENCES users(id),
                FOREIGN KEY (buyer_id) REFERENCES users(id),
                FOREIGN KEY (property_id) REFERENCES properties(id),
                FOREIGN KEY (visit_id) REFERENCES visits(id)
            )
        """)
        migrations_applied.append("Created 'reviews' table")
    
    # Check if role column exists
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]
    
    # Add role column if it doesn't exist
    if 'role' not in columns:
        print("   Adding 'role' column to users table...")
        cursor.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'buyer'")
        # Update existing users to have 'owner' role (since they were likely owners)
        cursor.execute("UPDATE users SET role = 'owner' WHERE role IS NULL OR role = ''")
        migrations_applied.append("Added 'role' column")
    
    # Add phone column if it doesn't exist
    if 'phone' not in columns:
        print("   Adding 'phone' column to users table...")
        cursor.execute("ALTER TABLE users ADD COLUMN phone TEXT")
        migrations_applied.append("Added 'phone' column")
    
    # Add date_of_birth column if it doesn't exist
    if 'date_of_birth' not in columns:
        print("   Adding 'date_of_birth' column to users table...")
        cursor.execute("ALTER TABLE users ADD COLUMN date_of_birth TEXT")
        migrations_applied.append("Added 'date_of_birth' column")
    
    # Add is_active column if it doesn't exist
    if 'is_active' not in columns:
        print("   Adding 'is_active' column to users table...")
        cursor.execute("ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1")
        migrations_applied.append("Added 'is_active' column")
    
    conn.commit()
    
    if migrations_applied:
        print(f"\n✅ Migration completed successfully!")
        print(f"   Applied {len(migrations_applied)} migration(s):")
        for migration in migrations_applied:
            print(f"   - {migration}")
    else:
        print("\n✅ Database is already up to date. No migrations needed.")
        
except Exception as e:
    print(f"\n❌ Error during migration: {e}")
    conn.rollback()
    raise
finally:
    conn.close()

