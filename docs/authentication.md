# Authentication Implementation Plan

## Overview

This document outlines the authentication system for the Diablo Gems API using Google OAuth2.0.

## System Components

### 1. Authentication Flow

- Google OAuth2.0 for user authentication
- JWT tokens for session management
- FastAPI security middleware for protected endpoints

### 2. User Tracking

- User information stored with each gem modification
- Audit trail for all changes
- Optimistic locking to prevent conflicting edits

### 3. Data Models

```python
# User model
class User(BaseModel):
    email: str
    name: str
    picture: Optional[str]
    
# Audit log model
class AuditLog(BaseModel):
    user_email: str
    action: str  # "create", "update", "delete"
    timestamp: datetime
    gem_path: str
    changes: Dict[str, Any]
    
# Version-tracked gem
class VersionedGem(BaseModel):
    version: int  # Incremented on each update
    last_modified_by: str
    last_modified_at: datetime
    gem: Gem
```

## Setup Instructions

### 1. Create Google OAuth2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen:
   - User Type: External
   - Application name: "Diablo Gems"
   - Authorized domains: Your domain
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: "Diablo Gems Web Client"
   - Authorized JavaScript origins:
     - <http://localhost:5173> (development)
     - Your production URL
   - Authorized redirect URIs:
     - <http://localhost:5173/auth/callback> (development)
     - Your production callback URL
7. Save the Client ID and Client Secret

### 2. Environment Configuration

Add to `.env` and `.env.example`:

```text
# Authentication
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
SECRET_KEY=generate_random_secret_key
AUTH_COOKIE_NAME=gems_auth
AUTH_COOKIE_DOMAIN=localhost
```

## Implementation Plan

### Phase 1: Authentication Setup

1. Add authentication dependencies
2. Implement Google OAuth routes
3. Add JWT token handling
4. Create protected route middleware

### Phase 2: User Tracking

1. Update gem models with version tracking
2. Implement audit logging
3. Add conflict prevention logic

### Phase 3: Frontend Integration

1. Add login/logout UI components
2. Implement authentication state management
3. Add user feedback for conflicts

## Security Considerations

- All sensitive data stored in environment variables
- JWT tokens stored in HTTP-only cookies
- CORS properly configured
- Rate limiting on authentication endpoints
- Regular audit log review capability
- Automatic session expiration

## API Changes

Protected endpoints will require authentication:

```text
POST /api/auth/login
GET /api/auth/logout
GET /api/auth/user

# Existing endpoints become protected:
PUT /api/gems/{gem_path}
POST /api/gems
DELETE /api/gems/{gem_path}
```

## Error Handling

- Invalid/expired tokens
- Concurrent edit conflicts
- Google OAuth failures
- Rate limit exceeded

## Testing

1. Authentication flow
2. Protected routes
3. Concurrent edit scenarios
4. Token expiration/renewal
5. Audit log accuracy

## Deployment Considerations

1. Secure environment variable management
2. CORS configuration for production
3. SSL/TLS requirements
4. Cookie domain configuration
