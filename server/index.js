const app = require('./app')

const PORT = process.env.PORT || 8000
// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur démarré sur le port ${PORT}`)
})