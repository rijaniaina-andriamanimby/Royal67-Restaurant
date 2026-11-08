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

ENV NODE_ENV=development
ENV PORT=8000

EXPOSE 8000

# Démarrage direct de l'application
CMD ["node", "index.js"]