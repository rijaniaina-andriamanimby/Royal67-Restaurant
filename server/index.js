const app = require('./app')

app.listen(process.env.PORT, ()=>{
    console.log(`Démarrage sur le port ${process.env.PORT}`)
})