
FROM node:22-alpine

WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm ci

# Copier le code React avec les permissions du nouvel utilisateur
COPY --chown=node:node . .

# Donner la propriété du répertoire de travail à node
RUN chown -R node:node /app

EXPOSE 5173

# Exécuter Vite sans privilèges root
USER node

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
