# Frontend Dockerfile - Festival App
# Angular + Nginx

# ================================
# Stage 1: Build Angular App
# ================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build Angular for production
RUN npm run build --configuration=production

# ================================
# Stage 2: Serve with Nginx
# ================================
FROM nginx:alpine AS production

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app from builder
COPY --from=builder /app/dist/front/browser /usr/share/nginx/html

# Create non-root user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://162.38.111.33:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
