# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and env file
COPY . .

# Set build-time environment variables
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Install curl
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Copy built assets and package files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install production dependencies
RUN npm install

# Create non-root user
#RUN useradd -m appuser && \
    #chown -R appuser:appuser data
#USER appuser

# Expose port
EXPOSE ${FRONTEND_PORT}

# Start the application
CMD ["npm", "run", "preview"]
