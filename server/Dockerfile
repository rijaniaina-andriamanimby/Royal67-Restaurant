
FROM node:22-alpine

WORKDIR /app

# Installer uniquement les dépendances nécessaires en production
COPY package*.json ./
RUN npm ci --omit=dev

# Copier le code source
COPY . .

EXPOSE 8000

# Démarrer Express sans nodemon
CMD ["node", "index.js"]
