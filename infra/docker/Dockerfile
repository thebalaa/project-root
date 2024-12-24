# Base Dockerfile for building your application
# Example: Node-based with optional build of a frontend

FROM node:18 AS builder

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Build application (if there's a build script)
RUN npm run build

# Production image
FROM node:18-alpine
WORKDIR /usr/src/app

# Copy from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Expose your application port
EXPOSE 3000

# Specify command
CMD ["node", "dist/index.js"]
