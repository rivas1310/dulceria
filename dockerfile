FROM node:18-alpine

WORKDIR /usr/src/app

# Instalar dependencias del sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    openssl

# Instalar PM2 globalmente
RUN npm install -g pm2

# Copiar archivos de configuración
COPY package*.json ./
COPY prisma ./prisma/
COPY .env ./


# Instalar dependencias
RUN npm install

# Generar Prisma Client
RUN npx prisma generate

# Copiar el resto de los archivos
COPY . .

# Construir la aplicación
RUN npm run build

EXPOSE 3000

# Usar PM2 para ejecutar la aplicación
CMD ["pm2-runtime", "npm", "--", "start"]
