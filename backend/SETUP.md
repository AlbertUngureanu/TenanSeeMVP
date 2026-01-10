# Quick Setup Guide

## 1. Install Dependencies

```bash
pip install -r requirements.txt
```

## 2. Run the Server

```bash
python run.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --port 3001
```

## 3. Database Migration (If updating existing database)

If you have an existing database and need to add new columns:

```bash
python -m app.migrate_db
```

This will add any missing columns (like `role`, `phone`, `date_of_birth`, `is_active`) to your existing database.

## 4. Seed Sample Data (Optional)

```bash
python -m app.seed_data
```

This will create:
- 3 sample users (all as owners)
- 6 sample properties

Test login credentials:
- Email: `ion.popescu@example.com`
- Password: `password123`

## 5. Clear All Data (Optional)

To delete all seeded data from the database:

```bash
python -m app.clear_data
```

This will remove all users, properties, and property images from the database.

## 6. Access the API

- API: http://localhost:3001
- Interactive Docs: http://localhost:3001/docs
- Alternative Docs: http://localhost:3001/redoc

## 7. Connect Frontend

Update your frontend `.env` file or set environment variable:
```
VITE_API_URL=http://127.0.0.1:3001/api
VITE_USE_REAL_BACKEND=true
```

Or in `vite.config.js`, you can set it to always use the backend in development.

## 8. Database Utilities

View database information:
```bash
python -m app.db_utils
```

For more database operations, see [DB_GUIDE.md](DB_GUIDE.md).

