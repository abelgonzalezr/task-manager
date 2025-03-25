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

# Instalar dependencias de Node.js
COPY package.json .
RUN npm install

# Copiar el código
COPY . .

# Puerto para desarrollo local (si es necesario)
EXPOSE 3000

# Por defecto, mostrar la ayuda de Serverless
CMD ["npx", "serverless", "--help"] 