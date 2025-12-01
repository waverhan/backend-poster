# Use Node.js 20 Debian slim image (glibc-based for better native module compatibility)
# Alpine (musl libc) causes segmentation faults with sharp and other native modules
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install system dependencies for native modules and Prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    python3 \
    make \
    g++ \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Copy Prisma schema first
COPY prisma ./prisma

# Install dependencies
RUN npm install --omit=dev

# Generate Prisma client
RUN npx prisma generate

# Copy rest of application code
COPY . .

# Create uploads directory
RUN mkdir -p public/images/products public/images/banners

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["./start.sh"]
