from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
import os
import json
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv
from models.gem import Gem, GemListItem
from models.gem_types import GemEffectType
from models.auth import TokenResponse, UserInfo
from auth.oauth import (
    verify_google_token,
    create_access_token,
    get_current_user
)
from fastapi.responses import RedirectResponse

# Load environment variables
load_dotenv()

# Initialize FastAPI app with metadata
app = FastAPI(
    title="Diablo Immortal Gems API",
    description="API for managing Diablo Immortal gem data"
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Request: {request.method} {request.url}")
    print(f"Headers: {request.headers}")
    response = await call_next(request)
    print(f"Response status: {response.status_code}")
    return response

@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Set security headers for cross-origin communication
    response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
    
    return response

# Enable CORS for configured origins
origins = os.getenv("CORS_ORIGINS", "https://dibo-gems.dukes.io").split(",")
print(f"CORS_ORIGINS env var: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Authorization"],
    expose_headers=["*"],
)

# Data directory path (relative to backend directory)
DATA_DIR = Path(os.path.join(os.path.dirname(__file__),"data"))

class Effect(BaseModel):
    """Represents a gem effect with its type, description, and conditions."""
    type: str = Field(..., description="Type of the effect")
    description: str = Field(..., description="Description of the effect")
    conditions: List[str] = Field(default_factory=list, description="Conditions for the effect")
    
    class Config:
        extra = "allow"
        json_schema_extra = {
            "examples": [
                {
                    "type": "resonance",
                    "description": "Increases damage",
                    "conditions": ["When health is above 50%"]
                }
            ]
        }

class Rank(BaseModel):
    """Represents a gem rank with its effects."""
    effects: List[Effect] = Field(..., description="List of effects at this rank")
    
    class Config:
        extra = "allow"

class GemMetadata(BaseModel):
    """Metadata information for a gem."""
    version: str = Field(..., description="Version of the gem data")
    last_updated: str = Field(..., description="Last update timestamp")
    
    class Config:
        extra = "allow"

class Gem(BaseModel):
    """Represents a complete gem with all its attributes."""
    metadata: GemMetadata = Field(..., description="Gem metadata")
    name: str = Field(..., description="Name of the gem")
    stars: str = Field(..., description="Star rating of the gem")
    description: str = Field(default="", description="Description of the gem")
    ranks: Dict[str, Rank] = Field(..., description="Ranks and their effects")
    file_path: str = Field(..., description="Path to the gem's JSON file")
    
    class Config:
        extra = "allow"

class GemListItem(BaseModel):
    """Basic information about a gem for list views."""
    name: str = Field(..., description="Name of the gem")
    stars: int = Field(..., description="Star rating of the gem")
    description: str = Field(..., description="Brief description of the gem")
    effects: List[str] = Field(default_factory=list, description="List of main effects")
    file_path: str = Field(..., description="Path to the gem's JSON file")

    class Config:
        extra = "allow"

class GoogleAuthRequest(BaseModel):
    """Request model for Google OAuth authentication."""
    credential: str = Field(..., description="Google OAuth credential token")

def convert_to_snake_case(s: str) -> str:
    """Convert a string to snake_case, handling gem names correctly."""
    # Remove the rank prefix (e.g. "1-", "2-", "5-")
    if s[0].isdigit() and s[1] == '-':
        s = s[2:]
    
    # Convert to lowercase and replace special characters
    s = s.lower().replace(" ", "_").replace("'", "").replace("&", "and").replace("-", "_")
    
    # Keep only alphanumeric and underscore characters
    s = ''.join(c for c in s if c.isalnum() or c == '_')
    
    return s

def load_gem(file_path: Path) -> Gem:
    """Load a gem from a JSON file."""
    try:
        with open(file_path) as f:
            data = json.load(f)
            data['file_path'] = str(file_path.relative_to(DATA_DIR))
            return Gem.model_validate(data)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error loading gem: {str(e)}")

def save_gem(file_path: Path, gem: Gem) -> None:
    """Save a gem to a JSON file."""
    try:
        # Remove file_path before saving to JSON
        data = gem.model_dump()
        data.pop('file_path', None)
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving gem: {str(e)}")

@app.post("/auth/google", response_model=TokenResponse)
async def google_auth(request: GoogleAuthRequest):
    """Authenticate with Google OAuth token."""
    user = verify_google_token(request.credential)
    access_token = create_access_token(user)
    return TokenResponse(access_token=access_token, token_type="bearer")

@app.get("/gems", response_model=List[GemListItem])
def list_gems() -> List[GemListItem]:
    """List all gems with their basic information."""
    print(f"DATA_DIR is: {DATA_DIR}")
    print(f"DATA_DIR exists: {DATA_DIR.exists()}")
    print(f"DATA_DIR contents: {list(DATA_DIR.iterdir()) if DATA_DIR.exists() else 'directory not found'}")
    
    gems = []
    
    for star_dir in ["1star", "2star", "5star"]:
        star_path = DATA_DIR / star_dir
        print(f"Checking {star_path}, exists: {star_path.exists()}")
        if not star_path.exists():
            continue
            
        for file_path in star_path.glob("*.json"):
            try:
                gem = load_gem(file_path)
                effects = []
                for effect in gem.ranks["1"].effects:
                    # Skip resonance and combat rating effects
                    if any(cond in effect.conditions for cond in ['resonance', 'combat_rating']):
                        continue
                    effects.append(effect.description)
                        
                gems.append(GemListItem(
                    name=gem.name,
                    stars=int(gem.stars),
                    description=gem.description,
                    effects=effects,
                    file_path=str(file_path.relative_to(DATA_DIR))
                ))
            except Exception as e:
                print(f"Error loading {file_path}: {e}")
                
    return sorted(gems, key=lambda g: (g.stars, g.name))

@app.get("/gems/{gem_path:path}", response_model=Gem)
def get_gem(gem_path: str) -> Gem:
    """Get a specific gem by its path."""
    file_path = DATA_DIR / gem_path
    return load_gem(file_path)

@app.put("/gems/{gem_path:path}", response_model=Gem)
async def update_gem(gem_path: str, gem: Gem, current_user: UserInfo = Depends(get_current_user)):
    """Update a specific gem."""
    # Extract star rating and convert name to snake case
    if not gem_path[0].isdigit():
        raise HTTPException(status_code=400, detail="Invalid gem path format")
    
    star_rating = f"{gem_path[0]}star"
    gem_name = convert_to_snake_case(gem_path.split('/')[-1])
    
    # Build paths
    gem_dir = os.path.join(DATA_DIR, star_rating)
    
    try:
        # Build file path
        file_path = Path(os.path.join(gem_dir, f"{gem_name}.json"))
        
        # Ensure the gem exists
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Gem not found")
        
        # Save the gem
        save_gem(file_path, gem)
        return gem
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/effect-types")
def get_effect_types() -> Dict[str, List[str]]:
    """Get all effect types and their descriptions."""
    return {
        "types": [e.value for e in GemEffectType],
        "descriptions": [
            "Triggered effects (e.g., on attack, on dash)",
            "Passive stat bonuses",
            "Direct damage effects",
            "Positive effects on self/allies",
            "Negative effects on enemies",
            "Defensive/absorb effects",
            "Summon temporary allies/effects",
            "Misc utility effects"
        ]
    }

@app.get("/export", response_model=Dict[str, Dict[str, Gem]])
async def export_gems():
    """Export all gem data.
    
    Returns:
        Dictionary containing all gems organized by star rating
        
    Raises:
        HTTPException: If there's an error reading the data
    """
    try:
        if not DATA_DIR.exists():
            raise HTTPException(
                status_code=500,
                detail=f"Data directory not found: {DATA_DIR}"
            )
            
        all_gems = {}
        for star_dir in DATA_DIR.iterdir():
            if star_dir.is_dir():
                star_rating = star_dir.name
                all_gems[star_rating] = {}
                
                for gem_file in star_dir.glob("*.json"):
                    gem_data = load_gem(gem_file)
                    all_gems[star_rating][gem_data["name"]] = gem_data
                    
        return all_gems
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error exporting gems: {str(e)}"
        )

from datetime import datetime
from datetime import timedelta
