# Use the official Node.js 20 image as the base
FROM node:20-slim

# Install system dependencies for canvas, ffmpeg, and other media processing
RUN apt-get update && apt-get install -y \
    ffmpeg \
    imagemagick \
    webp \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Create and set the working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Ensure session and database directories exist
RUN mkdir -p session database

# Set environment variables (can be overridden in docker-compose or .env)
ENV NODE_ENV=production

# Start the application
CMD ["node", "index.js"]
