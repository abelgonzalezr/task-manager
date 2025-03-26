#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}==============================================${NC}"
echo -e "${GREEN}     Starting development environment     ${NC}"
echo -e "${BLUE}==============================================${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed on this system.${NC}"
    echo -e "${YELLOW}Please install Docker and Docker Compose before continuing.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed on this system.${NC}"
    echo -e "${YELLOW}Please install Docker Compose before continuing.${NC}"
    exit 1
fi

# Grant execution permissions to backend script
if [ -f backend/docker-entrypoint.sh ]; then
    chmod +x backend/docker-entrypoint.sh
    echo -e "${GREEN}✅ Permissions granted to backend entry script.${NC}"
fi

# Build and run services
echo -e "${YELLOW}Building and starting services (may take a few minutes the first time)...${NC}"
docker compose up --build -d

echo ""
echo -e "${GREEN}✅ Services have started successfully!${NC}"
echo -e "${BLUE}==============================================${NC}"
echo -e "${YELLOW}The application is available at:${NC}"
echo -e "- Frontend: ${GREEN}http://localhost${NC}"
echo -e "- API Backend: ${GREEN}http://localhost:3000/dev${NC}"
echo -e "- MongoDB: ${GREEN}mongodb://localhost:27017${NC}"
echo ""
echo -e "${YELLOW}To stop the services, run:${NC}"
echo -e "${GREEN}docker compose down${NC}"
echo -e "${BLUE}==============================================${NC}"