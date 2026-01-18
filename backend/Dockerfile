# Backend Dockerfile - Festival App
# Node.js + TypeScript + Fastify + Prisma
# Uses tsx to run TypeScript directly (no compilation needed)

FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies for tsx)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source files
COPY src ./src
COPY data ./data
COPY scripts ./scripts

# run seeds

RUN npm run import:csv
RUN npm run prisma:seed

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S fastify -u 1001 -G nodejs

# Change ownership
RUN chown -R fastify:nodejs /app

USER fastify

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://162.38.111.33:3000/health || exit 1

# Start the application using tsx (runs TypeScript directly)
CMD ["npx", "tsx", "src/server.ts"]
