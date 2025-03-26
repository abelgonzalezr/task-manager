FROM node:18-alpine as build

WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Copiar el código fuente
COPY . .

# Crear archivo .env con configuración por defecto
RUN echo "REACT_APP_API_URL=http://localhost:3000/dev" > .env

# Construir la aplicación
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar los archivos de configuración de Nginx
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos de la aplicación
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 