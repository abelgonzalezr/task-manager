FROM python:3.9-slim

WORKDIR /app

# Install Node.js and npm for Serverless Framework
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install global serverless and Node.js dependencies with --legacy-peer-deps
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps && npm install -g serverless@3.40.0

# Copy the code
COPY . .

# Port for local development
EXPOSE 3000

# Startup script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]

# By default, start serverless offline
CMD ["npx", "serverless", "offline", "--host", "0.0.0.0"]