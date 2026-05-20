# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev) for building
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build:api

# Stage 2: Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built files from builder stage
COPY --from=builder /app/api/dist ./api/dist

# Copy any other necessary files
COPY --from=builder /app/api/db ./api/db
COPY --from=builder /app/api/services ./api/services
COPY --from=builder /app/api/middleware ./api/middleware
COPY --from=builder /app/api/routes ./api/routes
COPY --from=builder /app/api/app.js ./api/app.js
COPY --from=builder /app/api/server.js ./api/server.js

# Create data directory for SQLite
RUN mkdir -p /app/data

# Expose port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT/api/health || exit 1

# Start server
CMD ["npm", "run", "start:api"]
