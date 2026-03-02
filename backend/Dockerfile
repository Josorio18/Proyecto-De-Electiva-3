FROM node:20-alpine

WORKDIR /app

# Copiar solo package.json/package-lock para aprovechar la caché de Docker
COPY package*.json ./

# Instalar dependencias sin las de desarrollo (nodemon no es necesario en producción)
RUN npm install --omit=dev

# Copiar el resto del código
COPY . .

EXPOSE 3000

# Comando de arranque
CMD ["node", "index.js"]

