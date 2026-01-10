# IAS Rental Platform - Backend API

FastAPI backend for the IAS rental platform.

## Features

- User authentication (login/register)
- Property listings with filtering
- Property details
- Platform statistics
- SQLite database (easily upgradeable to PostgreSQL)

## Setup

### Prerequisites

- Python 3.8 or higher
- pip

### Installation

1. Create a virtual environment (recommended):
```bash
python -m venv venv
```

2. Activate the virtual environment:
   - On Windows:
   ```bash
   venv\Scripts\activate
   ```
   - On macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. (Optional) Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

## Running the Server

Start the development server:
```bash
uvicorn main:app --reload --port 3001
```

The API will be available at:
- API: http://127.0.0.1:3001
- API Documentation: http://localhost:3001/docs
- Alternative docs: http://localhost:3001/redoc

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Listings
- `GET /api/listings` - Get property listings (with filters)
  - Query params: `search`, `price`, `forSale`, `forRent`, `twoPlusRooms`

### Properties
- `GET /api/properties/{id}` - Get property details

### Statistics
- `GET /api/stats` - Get platform statistics

## Database

The application uses SQLite by default. The database file (`ias_rental.db`) will be created automatically on first run.

For detailed database usage instructions, see [DB_GUIDE.md](DB_GUIDE.md).

To use PostgreSQL instead:
1. Install PostgreSQL
2. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost/ias_rental
   ```
3. Install PostgreSQL driver:
   ```bash
   pip install psycopg2-binary
   ```

## Seeding Initial Data

To populate the database with sample data:

```bash
python -m app.seed_data
```

This creates 3 sample users and 6 sample properties.

### Clearing Data

To delete all data from the database:

```bash
python -m app.clear_data
```

This removes all users, properties, and property images.

## Development

The server runs with auto-reload enabled, so changes to the code will automatically restart the server.

## Production

For production deployment:
1. Set a strong `SECRET_KEY` in environment variables
2. Use a production database (PostgreSQL recommended)
3. Configure proper CORS origins
4. Use a production ASGI server like Gunicorn with Uvicorn workers:
   ```bash
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

