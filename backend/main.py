from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, listings, properties, stats, profile, visits, reviews
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="IAS Rental Platform API",
    description="Backend API for the IAS rental platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",  # Vite default port
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(listings.router, prefix="/api/listings", tags=["listings"])
app.include_router(properties.router, prefix="/api/properties", tags=["properties"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(visits.router, prefix="/api/visits", tags=["visits"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])


@app.get("/")
def root():
    return {"message": "IAS Rental Platform API", "version": "1.0.0"}


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

