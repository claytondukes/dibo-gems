# Authentication Documentation

## Overview

This document details the implemented authentication system for the Diablo Gems API using Google OAuth2.0.

## File Structure

```
backend/
├── auth/
│   ├── __init__.py
│   └── oauth.py          # OAuth implementation
├── models/
│   ├── __init__.py
│   └── auth.py          # Auth-related Pydantic models
├── main.py              # FastAPI routes
└── requirements.txt     # Python dependencies

frontend/
├── src/
│   ├── components/
│   │   └── common/
│   │       └── LoginButton.tsx    # Google login button
│   ├── services/
│   │   └── auth.ts               # Auth utilities
│   └── types/
│       └── auth.ts              # TypeScript definitions
├── .env.example                 # Environment variables
└── package.json                # Node.js dependencies
```

## System Components

### 1. Backend Implementation (/backend/auth/oauth.py)

#### Configuration
```python
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
LOCK_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl="https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl="https://oauth2.googleapis.com/token",
)
```

#### Key Functions

1. Token Verification:
```python
def verify_google_token(token: str) -> UserInfo:
    """Verifies Google's ID token and returns user info."""
    idinfo = id_token.verify_oauth2_token(
        token, requests.Request(), os.getenv("GOOGLE_CLIENT_ID")
    )
    
    if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
        raise ValueError("Invalid issuer")
        
    return UserInfo(
        email=idinfo["email"],
        name=idinfo["name"],
        picture=idinfo.get("picture")
    )
```

2. JWT Token Management:
```python
def create_access_token(user: UserInfo) -> str:
    """Creates JWT token for session management."""
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "sub": user.email,
        "name": user.name,
        "exp": expire
    }
    return jwt.encode(to_encode, os.getenv("JWT_SECRET"), algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInfo:
    """Validates JWT token and returns current user."""
    payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=[ALGORITHM])
    email: str = payload.get("sub")
    name: str = payload.get("name")
    return UserInfo(email=email, name=name)
```

### 2. Frontend Implementation

#### A. Authentication Service (/frontend/src/services/auth.ts)

1. Google OAuth Client:
```typescript
export const loadGoogleAuth = () => {
  return new Promise<void>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
};

export const initGoogleAuth = async () => {
  await loadGoogleAuth();
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleResponse,
  });
};
```

2. Token Management:
```typescript
const handleGoogleResponse = async (response: { credential: string }) => {
  const { data } = await api.post('/auth/google', { credential: response.credential });
  localStorage.setItem('token', data.access_token);
  authStateChange.dispatchEvent(new Event('change'));
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export const signOut = (): void => {
  localStorage.removeItem('token');
  authStateChange.dispatchEvent(new Event('change'));
};
```

#### B. Login Button Component (/frontend/src/components/common/LoginButton.tsx)

```typescript
export const LoginButton: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());

  useEffect(() => {
    const init = async () => {
      await initGoogleAuth();
      if (!loggedIn) {
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button')!,
          { 
            type: 'standard',
            theme: 'outline', 
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
          }
        );
      }
    };
    init();

    // Auth state change listener
    const handleAuthChange = () => setLoggedIn(isAuthenticated());
    authStateChange.addEventListener('change', handleAuthChange);
    return () => authStateChange.removeEventListener('change', handleAuthChange);
  }, [loggedIn]);

  if (loggedIn) {
    return <Button onClick={signOut}>Sign Out</Button>;
  }

  return <div id="google-signin-button" />;
};
```

### 3. Environment Configuration

#### Frontend (.env.example)
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_API_URL=https://gemapi.dukes.io
```

#### Backend (.env.example)
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-jwt-secret
```

### 4. Security Features

1. Token Security:
   - Google token verification with proper issuer validation
   - JWT tokens with expiration
   - Secure token storage in localStorage
   - Protected route middleware

2. Edit Lock System:
   - Prevents concurrent edits
   - Auto-expiring locks after 30 minutes
   - User-specific lock validation

### 5. User Flow

1. Initial Load:
   - Load Google OAuth client
   - Check existing auth state
   - Render appropriate button

2. Authentication:
   - Click Google Sign-In button
   - Complete Google OAuth flow
   - Exchange token with backend
   - Store JWT token
   - Update UI state

3. Protected Actions:
   - Validate JWT token
   - Check user permissions
   - Manage edit locks
   - Handle concurrent edits

### 6. Dependencies

#### Backend
```
google-auth
fastapi
python-jose[cryptography]
```

#### Frontend
```
@chakra-ui/react
axios
```

### 7. Error Handling

1. Authentication Errors:
   - Invalid Google tokens
   - Expired JWT tokens
   - Missing credentials

2. Lock Errors:
   - Concurrent edit attempts
   - Expired locks
   - Permission issues

### 8. Implementation Details

#### 1. Backend Models (models/auth.py)

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserInfo(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None

class EditLock(BaseModel):
    user_email: str
    user_name: str
    locked_at: datetime
    expires_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
```

#### 2. Backend Routes (main.py)

```python
from fastapi import FastAPI, Depends, HTTPException
from auth.oauth import verify_google_token, create_access_token, get_current_user
from models.auth import UserInfo, TokenResponse

app = FastAPI()

@app.post("/auth/google", response_model=TokenResponse)
async def google_auth(credential: str):
    try:
        user = verify_google_token(credential)
        token = create_access_token(user)
        return TokenResponse(access_token=token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.get("/auth/user", response_model=UserInfo)
async def get_user(user: UserInfo = Depends(get_current_user)):
    return user
```

#### 3. Frontend Types (types/auth.ts)

```typescript
export interface UserInfo {
  email: string;
  name: string;
  picture?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Google OAuth Window Interface
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement, options: {
            type: string;
            theme: string;
            size: string;
            text: string;
            shape: string;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}
```

### 9. Complete Setup Steps

1. Backend Setup:
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your Google OAuth credentials and JWT secret
```

2. Frontend Setup:
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Google client ID
```

3. Google OAuth Setup:
   - Create project in Google Cloud Console
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized origins:
     - http://localhost:5173 (dev)
     - https://your-production-domain.com
   - Add authorized redirect URIs:
     - http://localhost:5173 (dev)
     - https://your-production-domain.com

4. Start Services:
```bash
# Backend
cd backend
uvicorn main:app --reload

# Frontend
cd frontend
npm run dev
```

### 10. Recent Updates

#### Authentication Fixes
1. **Request Validation**:
   - Added Pydantic model `GoogleAuthRequest` to validate `/auth/google` request body
   - Ensures token is provided in correct format: `{"token": "..."}`

2. **Path Handling**:
   - Updated lock endpoints to handle gem paths correctly
   - Backend converts gem names to snake_case format
   - Properly handles special characters (spaces, apostrophes, hyphens)
   - Maintains star rating prefix (e.g. "1-", "2-", "5-")

3. **Directory Structure**:
   - Lock files are now stored in correct star directories
   - Example: `2-Battleguard` -> `2star/battleguard.lock`

4. **Frontend Updates**:
   - Updated API service to convert gem paths to snake_case
   - Preserves star rating prefix during conversion
   - Fixed release lock endpoint to use DELETE method

This implementation provides all necessary components for a complete rebuild of the authentication system.
