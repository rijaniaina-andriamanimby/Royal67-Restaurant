# Image volontairement simplifiée pour le laboratoire
FROM node:22-alpine

WORKDIR /app

# Mauvaise pratique pédagogique : ne pas utiliser le lockfile
COPY package.json ./
RUN npm install --no-package-lock --no-audit --no-fund \
    && npm cache clean --force

COPY . .

# Mauvaise pratique : l'application tourne en root
USER root

ENV HOST=0.0.0.0
EXPOSE 5173

# Serveur de développement Vite
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]