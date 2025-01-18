from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from .gem_types import GemEffectType, GemCondition

class GemMetadata(BaseModel):
    version: str
    last_updated: datetime

class GemEffect(BaseModel):
    type: GemEffectType
    description: str
    conditions: Optional[List[GemCondition]] = None
    value: Optional[float] = None
    duration: Optional[float] = None
    cooldown: Optional[float] = None

class GemRank(BaseModel):
    effects: List[GemEffect]

class Gem(BaseModel):
    name: str
    stars: str  # Changed to str since it's a string in the JSON
    description: str = ""  # Made optional with default empty string
    metadata: GemMetadata
    ranks: Dict[str, GemRank]

class GemListItem(BaseModel):
    name: str
    stars: int  # Keep as int for frontend
    description: str
    effects: List[str]
    file_path: str = Field(default='')
