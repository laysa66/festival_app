#!/bin/bash

# ================================
# Festival App - Deployment Script
# ================================
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="festival_app"
DEPLOY_PATH="~/festival_app"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Festival App - Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if Docker is running
echo -e "${YELLOW}🔍 Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker compose down --remove-orphans || true

# Build images
echo -e "${YELLOW}🏗️  Building Docker images...${NC}"
docker compose build --no-cache

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker compose up -d

# Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
sleep 10

# Run migrations
echo -e "${YELLOW}📊 Running database migrations...${NC}"
docker compose exec -T backend npx prisma migrate deploy || echo -e "${YELLOW}⚠️  Migrations skipped or already applied${NC}"

# Show status
echo -e "${YELLOW}📋 Container status:${NC}"
docker compose ps

# Health checks
echo -e "${YELLOW}🏥 Running health checks...${NC}"
sleep 5

# Check frontend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -q "200"; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
fi

# Check backend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health | grep -q "200"; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e ""
echo -e "📍 Frontend: ${GREEN}http://localhost${NC}"
echo -e "📍 Backend API: ${GREEN}http://localhost:3000${NC}"
echo -e "📍 Adminer (dev): ${GREEN}http://localhost:8080${NC}"
echo -e ""
echo -e "💡 To view logs: ${YELLOW}docker compose logs -f${NC}"
echo -e "💡 To stop: ${YELLOW}docker compose down${NC}"
