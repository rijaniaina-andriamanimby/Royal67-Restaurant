
FROM node:22-alpine

WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm ci

# Copier le code React
COPY . .

EXPOSE 5173

# Démarrer Vite et rendre le serveur accessible depuis l'extérieur
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
