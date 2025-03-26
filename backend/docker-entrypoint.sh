#!/bin/bash
set -e

# Esperar si hay una base de datos externa (en caso de usarse)
# sleep 10

# Verificar si existe el archivo .env, si no crearlo con valores por defecto
if [ ! -f .env ]; then
  echo "# MongoDB" > .env
  echo "MONGODB_URI=${MONGODB_URI:-mongodb://mongodb:27017/}" >> .env
  echo "MONGODB_DB_NAME=${MONGODB_DB_NAME:-task_management}" >> .env
  echo "" >> .env
  echo "# AWS Region" >> .env
  echo "REGION=${REGION:-us-east-1}" >> .env
  echo "" >> .env
  echo "# Estos valores se obtendrán después del primer despliegue" >> .env
  echo "COGNITO_USER_POOL_ID=${COGNITO_USER_POOL_ID:-local_cognito_pool}" >> .env
  echo "COGNITO_CLIENT_ID=${COGNITO_CLIENT_ID:-local_client_id}" >> .env
fi

# Configuración de entorno para desarrollo local
if [ ! -f env.json ]; then
  echo '{
    "MONGODB_URI": "'"${MONGODB_URI:-mongodb://mongodb:27017/}"'",
    "MONGODB_DB_NAME": "'"${MONGODB_DB_NAME:-task_management}"'",
    "REGION": "'"${REGION:-us-east-1}"'",
    "COGNITO_USER_POOL_ID": "'"${COGNITO_USER_POOL_ID:-local_cognito_pool}"'",
    "COGNITO_CLIENT_ID": "'"${COGNITO_CLIENT_ID:-local_client_id}"'"
  }' > env.json
fi

echo "Iniciando la aplicación..."
exec "$@" 