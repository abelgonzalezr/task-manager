FROM python:3.9-slim

WORKDIR /app

# Instalar Node.js y npm para Serverless Framework
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Instalar serverless global y dependencias de Node.js
COPY package.json package-lock.json ./
RUN npm ci && npm install -g serverless

# Copiar el código
COPY . .

# Puerto para desarrollo local
EXPOSE 3000

# Script de inicio
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]

# Por defecto, iniciar serverless offline
CMD ["npx", "serverless", "offline", "--host", "0.0.0.0"] 