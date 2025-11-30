const express = require('express')
const app = express()
require('dotenv').config()
app.use(express.json())

//------------------------
// Router
//------------------------
const menuRouter = require('./routes/menu.routes')

app.use('/menu', menuRouter)

module.exports = app