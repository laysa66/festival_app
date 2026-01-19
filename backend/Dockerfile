# Backend Dockerfile - Festival App
# Node.js + TypeScript + Fastify + Prisma
# Uses tsx to run TypeScript directly (no compilation needed)

FROM node:22-alpine

# Accept build arguments
ARG DATABASE_URL
ARG JWT_SECRET
ARG POSTGRES_USER
ARG POSTGRES_PASSWORD
ARG POSTGRES_DB
ARG PORT=3000
ARG NODE_ENV=production
ARG HOST=0.0.0.0
ARG CORS_ORIGIN

# Set environment variables
ENV DATABASE_URL=$DATABASE_URL
ENV JWT_SECRET=$JWT_SECRET
ENV POSTGRES_USER=$POSTGRES_USER
ENV POSTGRES_PASSWORD=$POSTGRES_PASSWORD
ENV POSTGRES_DB=$POSTGRES_DB
ENV PORT=$PORT
ENV NODE_ENV=$NODE_ENV
ENV HOST=$HOST
ENV CORS_ORIGIN=$CORS_ORIGIN

WORKDIR /app

# Copy package files from backend directory
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
