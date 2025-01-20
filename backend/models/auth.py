from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr, ConfigDict

class TokenResponse(BaseModel):
    model_config = ConfigDict(frozen=True)
    
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")

class UserInfo(BaseModel):
    model_config = ConfigDict(frozen=True)
    
    email: EmailStr = Field(..., description="User's email address")
    name: str = Field(..., description="User's full name")
    picture: str | None = Field(default=None, description="URL to user's profile picture")

class TokenPayload(BaseModel):
    model_config = ConfigDict(frozen=True)
    
    sub: EmailStr = Field(..., description="User's email (subject)")
    name: str = Field(..., description="User's full name")
    exp: int = Field(..., description="Token expiration timestamp")
    iat: int = Field(..., description="Token issued at timestamp")
    jti: str = Field(..., description="Unique token identifier")
