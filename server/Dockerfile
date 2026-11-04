
FROM node:22-alpine

WORKDIR /app

# Installer uniquement les dépendances nécessaires en production
COPY package*.json ./
RUN npm ci --omit=dev

# Copier le code source avec les bonnes permissions
COPY --chown=node:node . .

EXPOSE 8000

# Exécuter Express sans privilèges root
USER node

CMD ["node", "index.js"]
