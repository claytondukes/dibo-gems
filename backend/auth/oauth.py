from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Dict, Optional
from models.auth import UserInfo, TokenPayload
import json
from pathlib import Path
import uuid

# Constants
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
DATA_DIR = os.environ.get("DATA_DIR")

# Initialize OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_google_token(token: str) -> UserInfo:
    """Verifies Google's ID token and returns user info."""
    try:
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), os.environ.get("GOOGLE_CLIENT_ID")
        )
        
        if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
            raise ValueError("Invalid issuer")
            
        return UserInfo(
            email=idinfo["email"],
            name=idinfo["name"],
            picture=idinfo.get("picture")
        )
    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )

def create_access_token(user: UserInfo) -> str:
    """Creates JWT token for session management."""
    now = datetime.utcnow()
    expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    token_data = TokenPayload(
        sub=user.email,
        name=user.name,
        exp=int(expire.timestamp()),
        iat=int(now.timestamp()),
        jti=str(uuid.uuid4())
    )
    
    return jwt.encode(
        token_data.model_dump(),
        os.environ.get("JWT_SECRET"),
        algorithm=ALGORITHM
    )

def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInfo:
    """Validates JWT token and returns current user."""
    try:
        payload = jwt.decode(
            token,
            os.environ.get("JWT_SECRET"),
            algorithms=[ALGORITHM]
        )
        token_data = TokenPayload(**payload)
        
        return UserInfo(
            email=token_data.sub,
            name=token_data.name
        )
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
