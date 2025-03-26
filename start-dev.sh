#!/bin/bash
set -e

# Colores para la salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Imprimir cabecera
echo -e "${BLUE}==============================================${NC}"
echo -e "${GREEN}     Iniciando el entorno de desarrollo     ${NC}"
echo -e "${BLUE}==============================================${NC}"
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker no está instalado en este sistema.${NC}"
    echo -e "${YELLOW}Por favor, instala Docker y Docker Compose antes de continuar.${NC}"
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose no está instalado en este sistema.${NC}"
    echo -e "${YELLOW}Por favor, instala Docker Compose antes de continuar.${NC}"
    exit 1
fi

# Otorgar permisos de ejecución al script del backend
if [ -f backend/docker-entrypoint.sh ]; then
    chmod +x backend/docker-entrypoint.sh
    echo -e "${GREEN}✅ Permisos otorgados al script de entrada del backend.${NC}"
fi

# Compilar y ejecutar los servicios
echo -e "${YELLOW}Construyendo y levantando los servicios (puede tardar unos minutos la primera vez)...${NC}"
docker compose up --build -d

echo ""
echo -e "${GREEN}✅ ¡Los servicios se han iniciado correctamente!${NC}"
echo -e "${BLUE}==============================================${NC}"
echo -e "${YELLOW}La aplicación está disponible en:${NC}"
echo -e "- Frontend: ${GREEN}http://localhost${NC}"
echo -e "- API Backend: ${GREEN}http://localhost:3000/dev${NC}"
echo -e "- MongoDB: ${GREEN}mongodb://localhost:27017${NC}"
echo ""
echo -e "${YELLOW}Para detener los servicios, ejecuta:${NC}"
echo -e "${GREEN}docker-compose down${NC}"
echo -e "${BLUE}==============================================${NC}" 