# Frontend Dockerfile - Festival App
# Angular + Nginx
#http://162.38.111.33:80/
# ================================
# Stage 1: Build Angular App
# ================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build --configuration=production

# ================================
# Stage 2: Serve with Nginx
# ================================
FROM nginx:alpine AS production

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/default.conf



# Install openssl for cert generation
RUN apk add --no-cache openssl

# Generate self-signed SSL certs if not present
RUN mkdir -p /etc/nginx/certs && \
    if [ ! -f /etc/nginx/certs/local.crt ] || [ ! -f /etc/nginx/certs/local.key ]; then \
      openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/certs/local.key \
        -out /etc/nginx/certs/local.crt \
        -subj "/C=FR/ST=IDF/L=Paris/O=LocalDev/CN=localhost"; \
    fi

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app
COPY --from=builder /app/dist/front/browser /usr/share/nginx/html

# Permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Expose HTTP + HTTPS
EXPOSE 80 443

# Health check (HTTPS)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-check-certificate --no-verbose --tries=1 --spider https://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
