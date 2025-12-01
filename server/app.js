const express = require('express')
const app = express()
require('dotenv').config()
app.use(express.json())

//------------------------
// Router
//------------------------
const menuRouter = require('./routes/menu.routes')
const commandeRouter = require('./routes/commande.routes')

app.use('/menu', menuRouter)
app.use('/commande', commandeRouter)

module.exports = app