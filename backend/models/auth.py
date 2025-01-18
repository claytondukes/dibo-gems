from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserInfo(BaseModel):
    email: EmailStr
    name: str
    picture: str | None = None

class EditLock(BaseModel):
    user_email: str
    user_name: str
    locked_at: datetime
    expires_at: datetime

class LockInfo(BaseModel):
    user_email: EmailStr
    user_name: str
    locked_at: datetime
    expires_at: datetime

class TokenPayload(BaseModel):
    sub: EmailStr  # user's email
    name: str
    exp: int  # expiration timestamp
