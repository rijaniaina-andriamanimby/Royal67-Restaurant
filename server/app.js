const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
app.use(express.json())
app.use(cors({
    origin: process.env.API
}))
//------------------------
// Router
//------------------------
const menuRouter = require('./routes/menu.routes')
const commandeRouter = require('./routes/commande.routes')
const statsRouter = require('./routes/stats.routes')

app.use('/menu', menuRouter)
app.use('/commande', commandeRouter)
app.use('/stats', statsRouter)

module.exports = app