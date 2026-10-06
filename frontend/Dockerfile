# Pulso360 — Frontend Dockerfile (Multi-stage build con Vite y Nginx)

# Etapa 1: Compilación de la aplicación React
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Generar artefactos estáticos de producción
RUN npm run build

# Etapa 2: Servidor web estático Nginx ultraligero
FROM nginx:alpine AS runner

# Copiar configuración personalizada para SPA y compresión gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar el paquete compilado desde la etapa de construcción
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
