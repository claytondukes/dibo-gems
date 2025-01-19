from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Dict, Optional
from models.auth import UserInfo, EditLock, TokenPayload
import json
from pathlib import Path
import uuid

# Constants
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
LOCK_EXPIRE_MINUTES = int(os.environ.get("LOCK_EXPIRE_MINUTES", "30"))
ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")

# Initialize OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Lock management
active_locks: Dict[str, EditLock] = {}
LOCKS_FILE = Path("data/locks.json")

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

def acquire_lock(gem_path: str, user: UserInfo) -> Optional[EditLock]:
    """Try to acquire an edit lock for a gem. Returns None if already locked."""
    now = datetime.utcnow()
    
    # Clean expired locks
    clean_expired_locks()
    
    # Check if gem is locked
    if gem_path in active_locks:
        return None
        
    # Create new lock
    lock = EditLock(
        user_email=user.email,
        user_name=user.name,
        locked_at=now,
        expires_at=now + timedelta(minutes=LOCK_EXPIRE_MINUTES)
    )
    active_locks[gem_path] = lock
    save_locks()
    return lock

def release_lock(gem_path: str, user: UserInfo) -> bool:
    """Release a lock if it belongs to the user."""
    if gem_path in active_locks and active_locks[gem_path].user_email == user.email:
        del active_locks[gem_path]
        save_locks()
        return True
    return False

def clean_expired_locks():
    """Remove expired locks."""
    now = datetime.utcnow()
    expired = [
        path for path, lock in active_locks.items()
        if lock.expires_at < now
    ]
    for path in expired:
        del active_locks[path]
    if expired:
        save_locks()

def save_locks():
    """Save locks to file for persistence."""
    LOCKS_FILE.parent.mkdir(exist_ok=True)
    with open(LOCKS_FILE, 'w') as f:
        json.dump({
            path: lock.model_dump() 
            for path, lock in active_locks.items()
        }, f)

def load_locks():
    """Load locks from file on startup."""
    if LOCKS_FILE.exists():
        with open(LOCKS_FILE) as f:
            data = json.load(f)
            for path, lock_data in data.items():
                active_locks[path] = EditLock(**lock_data)
    clean_expired_locks()
