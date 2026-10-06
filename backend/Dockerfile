# Pulso360 — Backend Dockerfile (Node.js 20 Alpine)
FROM node:20-alpine AS runner

WORKDIR /app

# Instalar dependencias de producción
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copiar código fuente y esquemas de base de datos
COPY src ./src
COPY database ./database

# Puerto de la API
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Verificación de salud del contenedor
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 3000) + '/api/v1/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "src/index.js"]
