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
    description: str = Field(default="", description="Description of the gem")
    ranks: Dict[str, Rank] = Field(..., description="Ranks and their effects")
    
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

def load_gem(file_path: Path) -> Dict:
    """Load a gem from a JSON file.
    
    Args:
        file_path: Path to the JSON file
        
    Returns:
        Dictionary containing gem information
        
    Raises:
        HTTPException: If there's an error reading or parsing the file
    """
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
            # Ensure description exists
            if 'description' not in data:
                data['description'] = ''
            return data
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid JSON in {file_path.name}: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error reading {file_path.name}: {str(e)}"
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

def convert_to_snake_case(name: str) -> str:
    """Convert a string to snake case.
    
    Args:
        name: String to convert
        
    Returns:
        Snake case version of the string
        
    Examples:
        >>> convert_to_snake_case("Blood-Soaked Jade")
        'blood_soaked_jade'
        >>> convert_to_snake_case("Berserker's Eye")
        'berserkers_eye'
    """
    # Remove apostrophes first
    name = name.replace("'", "")
    # Replace hyphens with spaces
    name = name.replace('-', ' ')
    # Convert to lowercase and replace spaces with underscores
    return name.lower().replace(' ', '_')

@app.get("/gems", response_model=List[GemListItem])
async def list_gems():
    """List all gems with their basic information.
    
    Returns:
        List of dictionaries containing basic gem information
        
    Raises:
        HTTPException: If there's an error reading the data directory
    """
    try:
        gems = []
        for star_dir in DATA_DIR.iterdir():
            if not star_dir.is_dir() or not star_dir.name.endswith('star'):
                continue
                
            for gem_file in star_dir.glob('*.json'):
                try:
                    with open(gem_file, 'r') as f:
                        data = json.load(f)
                        # Extract main effects from rank 1
                        main_effects = []
                        if data.get('ranks') and data['ranks'].get('1'):
                            for effect in data['ranks']['1'].get('effects', []):
                                main_effects.append(effect.get('description', ''))
                        
                        gems.append(GemListItem(
                            name=data['name'],
                            stars=int(star_dir.name[0]),  # Extract star rating from directory name
                            description=data.get('description', ''),
                            effects=main_effects,
                            file_path=str(gem_file.relative_to(DATA_DIR))
                        ))
                except (json.JSONDecodeError, KeyError) as e:
                    print(f"Error reading {gem_file}: {e}")
                    continue
                    
        return sorted(gems, key=lambda x: (x.stars, x.name))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list gems: {str(e)}"
        )

@app.get("/gems/{star_rating}/{gem_name}", response_model=Gem)
async def get_gem(star_rating: int, gem_name: str) -> Dict:
    """Get detailed information about a specific gem.
    
    Args:
        star_rating: Number of stars (1, 2, or 5)
        gem_name: Name of the gem
        
    Returns:
        Dictionary containing gem information
        
    Raises:
        HTTPException: If gem is not found or there's an error reading the file
    """
    try:
        # Convert the URL-decoded name to snake case
        file_name = f"{convert_to_snake_case(gem_name)}.json"
        file_path = DATA_DIR / f"{star_rating}star" / file_name
        
        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Gem not found: {gem_name} ({star_rating} stars)"
            )
            
        return load_gem(file_path)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=500,
            detail=f"Error loading gem {gem_name}: {str(e)}"
        )

@app.put("/gems/{star_rating}/{gem_name}", response_model=Gem)
async def update_gem(star_rating: int, gem_name: str, gem: Gem) -> Dict:
    """Update a specific gem's information.
    
    Args:
        star_rating: Number of stars (1, 2, or 5)
        gem_name: Name of the gem
        gem: Updated gem data
        
    Returns:
        Updated gem information
        
    Raises:
        HTTPException: If there's an error saving the file
    """
    try:
        # Convert the URL-decoded name to snake case
        file_name = f"{convert_to_snake_case(gem_name)}.json"
        file_path = DATA_DIR / f"{star_rating}star" / file_name
        
        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Gem not found: {gem_name} ({star_rating} stars)"
            )
            
        save_gem(file_path, gem.dict())
        return gem
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=500,
            detail=f"Error updating gem {gem_name}: {str(e)}"
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
