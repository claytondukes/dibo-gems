# Gem Collection Web Application Design Document

## Overview

A web-based application for viewing and collaboratively editing Diablo Immortal gem data. The application will provide a user-friendly interface while maintaining data in a structured JSON format.

## Core Features

1. View and edit gem information
2. Collaborative editing
3. Data validation
4. Export functionality
5. Search and filter capabilities

## Technical Architecture

### Frontend (React + TypeScript)

```typescript
// Key Components
- App.tsx                 // Main application component
- components/
  - GemList/             // List of all gems with filtering
    - GemCard.tsx        // Individual gem preview card
    - FilterBar.tsx      // Star rating and search filters
  - GemEditor/           // Gem editing interface
    - GemForm.tsx        // Form for editing gem details
    - RankTable.tsx      // Table for editing rank values
  - common/              // Reusable components
    - Button.tsx
    - Table.tsx
    - Modal.tsx
```

### Backend (FastAPI)

```python
# Core Components
- main.py               # FastAPI application entry point
- routes/
  - gems.py            # Gem CRUD operations
  - auth.py            # Basic authentication
- models/
  - gem.py            # Pydantic models for gem data
- services/
  - gem_service.py    # Business logic for gem operations
  - file_service.py   # JSON file operations
```

### Data Models

```typescript
// Gem Type Definitions
interface Gem {
  name: string;
  stars: 1 | 2 | 5;
  metadata: {
    version: string;
    last_updated: string;
  };
  ranks: {
    [key: string]: {  // 1-10
      effects: Array<{
        type: string;
        description: string;
        conditions?: string[];
      }>;
    };
  };
}

// API Response Types
interface GemResponse {
  gems: Gem[];
  total: number;
  page: number;
  per_page: number;
}
```

## API Endpoints

### Gems

```text
GET    /api/gems              # List all gems (with filtering)
GET    /api/gems/{id}         # Get single gem
PUT    /api/gems/{id}         # Update gem
GET    /api/gems/export       # Export gems to CSV/JSON
```

### Authentication

```text
POST   /api/auth/login        # Login
POST   /api/auth/logout       # Logout
GET    /api/auth/me          # Get current user
```

## User Interface

### Main View

```text
+------------------------+
|  Filter Bar           |
|------------------------|
|  [ Gem Cards ]        |
|  +----------------+   |
|  | Name          |   |
|  | Description   |   |
|  | Preview Table |   |
|  +----------------+   |
|                      |
+------------------------+
```

### Gem Editor

```text
+------------------------+
| Gem Name              |
|------------------------|
| Description           |
|------------------------|
| Effects Table         |
| Rank | Val1 | Val2    |
|  1   |  x   |   y     |
|  2   |  x   |   y     |
|------------------------|
| [ Save ] [ Cancel ]    |
+------------------------+
```

## Data Flow

1. Initial load:
   - Load gem data from JSON files
   - Parse into application data model
   - Cache for performance

2. Updates:
   - Validate changes against schema
   - Write to temporary storage
   - Require approval for permanent changes
   - Write back to JSON files

## Development Setup

### Prerequisites

```bash
# Required tools
- Node.js 18+
- Python 3.11+
- Docker
```

### Project Structure

```text
gem-collection/
├── frontend/           # React application
├── backend/           # FastAPI application
├── data/             # Gem JSON files
├── docker/           # Docker configuration
└── docs/             # Documentation
```

### Configuration

```yaml
# config.yaml
app:
  name: "Gem Collection"
  version: "1.0.0"

server:
  host: "0.0.0.0"
  port: 8000
  
database:
  type: "file"
  path: "./data"

auth:
  session_duration: 24h
  allowed_editors: ["admin"]
```

## Deployment

### Docker Setup

```dockerfile
# Multi-stage build for optimized image size
FROM node:18 as frontend-builder
WORKDIR /app/frontend
COPY frontend/ .
RUN npm install && npm run build

FROM python:3.11-slim
WORKDIR /app
COPY backend/ .
COPY --from=frontend-builder /app/frontend/build ./static
RUN pip install -r requirements.txt

CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
```

### Environment Variables

```bash
GEMS_DATA_PATH=/app/data
AUTH_SECRET_KEY=your-secret-key
ALLOWED_ORIGINS=http://localhost:3000
```

## Security Considerations

1. Input validation for all gem data
2. Rate limiting on API endpoints
3. Authentication for editors
4. Audit logging for changes
5. Regular backups of gem data

## Future Enhancements

1. Real-time collaboration
2. Change history and versioning
3. Advanced search capabilities
4. Mobile app version
5. Integration with game API (if available)

## Development Timeline

1. Phase 1: Basic CRUD operations (1 week)
2. Phase 2: Authentication and authorization (3 days)
3. Phase 3: UI polish and responsiveness (4 days)
4. Phase 4: Testing and deployment (3 days)

## Testing Strategy

1. Unit tests for data models
2. Integration tests for API endpoints
3. E2E tests for critical user flows
4. Performance testing for data operations

## Monitoring

1. Application health metrics
2. User activity logging
3. Error tracking
4. Performance monitoring

This design provides a foundation for building a collaborative gem data management system while maintaining the existing JSON structure. The modular architecture allows for easy expansion and modification as requirements evolve.
