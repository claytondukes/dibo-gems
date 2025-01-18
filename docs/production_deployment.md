# Production Deployment Guide

## Backend Deployment

1. Install production dependencies:
```bash
pip install -r backend/requirements.txt
```

2. Set up environment variables:
- Copy `.env.example` to `.env`
- Update the values for production environment

3. Run the backend using Gunicorn (replace workers count based on your CPU cores):
```bash
cd backend
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Frontend Deployment

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Build for production:
```bash
npm run build
```

3. The built files will be in the `dist` directory. Serve these files using a static file server like nginx.

Example nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Serve frontend
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Variables

Make sure to set these environment variables in production:
- Set `NODE_ENV=production` for frontend
- Update backend `.env` with production values
- Ensure all sensitive information is properly secured

## Security Considerations

1. Always use HTTPS in production
2. Set appropriate CORS headers
3. Use secure session handling
4. Implement rate limiting
5. Regular security updates
6. Proper logging and monitoring

## Monitoring

Consider setting up:
1. Application monitoring (e.g., Sentry)
2. Server monitoring (e.g., Prometheus + Grafana)
3. Log aggregation (e.g., ELK stack)
