import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Local imports - no smart_planner prefix needed
from api import router as smart_planner_router

# Create FastAPI app
app = FastAPI(
    title="Smart Planner API",
    description="API for parsing and optimizing tasks on Concordia University campus",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only. Restrict in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(smart_planner_router)

# Root endpoint - redirect to the static index.html
@app.get("/")
async def root():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/static/index.html")

# Create the static directory if it doesn't exist
os.makedirs("static", exist_ok=True)

# Mount the static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    # Get port from environment variable or use default
    port = int(os.getenv("PORT", "8000"))
    
    print(f"Starting Smart Planner API on http://localhost:{port}")
    print(f"Visit http://localhost:{port}/static/index.html to use the web interface")
    
    # Run the FastAPI app with uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)