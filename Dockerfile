# Use Node.js 20 LTS (required by dependencies like sqlite3)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use --omit=dev for production)
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build:api

# Create data directory for SQLite
RUN mkdir -p /app/data

# Expose port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT/api/health || exit 1

# Start server
CMD ["npm", "run", "start:api"]
