from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
import json
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app with metadata
app = FastAPI(
    title="Diablo Immortal Gems API",
    version=os.getenv("API_VERSION", "1.0.0"),
    description="API for managing Diablo Immortal gem data"
)

# Enable CORS for configured origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data directory path from environment variable
DATA_DIR = Path(os.getenv("DATA_DIR", Path(__file__).parent.parent / "data"))

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
    ranks: Dict[str, Rank] = Field(..., description="Ranks and their effects")
    
    class Config:
        extra = "allow"

def load_gem(file_path: Path) -> Dict:
    """Load a gem from a JSON file.
    
    Args:
        file_path: Path to the JSON file
        
    Returns:
        Dict containing the gem data
        
    Raises:
        HTTPException: If file not found or invalid JSON
    """
    try:
        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Gem file not found: {file_path.name}"
            )
        with open(file_path, 'r') as f:
            data = json.load(f)
            # Validate data against Gem model
            Gem.model_validate(data)
            return data
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid JSON in {file_path.name}: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error loading gem {file_path.name}: {str(e)}"
        )

def save_gem(file_path: Path, gem_data: Dict) -> None:
    """Save a gem to a JSON file.
    
    Args:
        file_path: Path where to save the JSON file
        gem_data: Dictionary containing the gem data
        
    Raises:
        HTTPException: If validation fails or write error occurs
    """
    try:
        # Validate data against Gem model
        Gem.model_validate(gem_data)
        
        # Ensure directory exists
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_path, 'w') as f:
            json.dump(gem_data, f, indent=2)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error saving gem {file_path.name}: {str(e)}"
        )

@app.get("/gems", response_model=List[Dict[str, str]])
async def list_gems():
    """List all gems with their basic information.
    
    Returns:
        List of dictionaries containing basic gem information
        
    Raises:
        HTTPException: If there's an error reading the data directory
    """
    try:
        if not DATA_DIR.exists():
            raise HTTPException(
                status_code=500,
                detail=f"Data directory not found: {DATA_DIR}"
            )
            
        gems = []
        for star_dir in DATA_DIR.iterdir():
            if star_dir.is_dir():
                for gem_file in star_dir.glob("*.json"):
                    try:
                        gem_data = load_gem(gem_file)
                        gems.append({
                            "name": gem_data["name"],
                            "stars": gem_data["stars"],
                            "file_path": str(gem_file.relative_to(DATA_DIR))
                        })
                    except Exception as e:
                        # Log error but continue processing other gems
                        print(f"Error loading {gem_file}: {e}")
        return gems
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error listing gems: {str(e)}"
        )

@app.get("/gems/{star_rating}/{gem_name}", response_model=Gem)
async def get_gem(star_rating: str, gem_name: str):
    """Get detailed information for a specific gem.
    
    Args:
        star_rating: Star rating of the gem
        gem_name: Name of the gem
        
    Returns:
        Complete gem data
        
    Raises:
        HTTPException: If gem not found or invalid data
    """
    # Convert spaces to underscores and make lowercase
    gem_name = gem_name.replace(" ", "_").lower()
    # Add 'star' to the directory name
    star_dir = f"{star_rating}star"
    file_path = DATA_DIR / star_dir / f"{gem_name}.json"
    return load_gem(file_path)

@app.put("/gems/{star_rating}/{gem_name}", response_model=Gem)
async def update_gem(
    star_rating: str,
    gem_name: str,
    gem_data: Gem
):
    """Update a specific gem's information.
    
    Args:
        star_rating: Star rating of the gem
        gem_name: Name of the gem
        gem_data: Updated gem data
        
    Returns:
        Updated gem data
        
    Raises:
        HTTPException: If gem not found or validation fails
    """
    # Convert spaces to underscores and make lowercase
    gem_name = gem_name.replace(" ", "_").lower()
    # Add 'star' to the directory name
    star_dir = f"{star_rating}star"
    file_path = DATA_DIR / star_dir / f"{gem_name}.json"
    
    # Verify the gem exists
    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Gem not found: {gem_name}"
        )
    
    try:
        save_gem(file_path, gem_data.model_dump())
        return gem_data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update gem: {str(e)}"
        )

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
