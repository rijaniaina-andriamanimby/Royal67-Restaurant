const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const db = require('./db/db')
app.use(express.json())
app.use(cors({
    origin: process.env.API
}))

// Readiness endpoint: confirms that Express can reach PostgreSQL.
app.get('/health', async (_req, res) => {
    try {
        await db.query('SELECT 1')
        res.status(200).json({
            status: 'ok',
            database: 'connected',
            commit: process.env.RENDER_GIT_COMMIT || null
        })
    } catch (_error) {
        res.status(503).json({ status: 'error', database: 'unavailable' })
    }
})
//------------------------
// Router
//------------------------
const menuRouter = require('./routes/menu.routes')
const commandeRouter = require('./routes/commande.routes')
const statsRouter = require('./routes/stats.routes')
const categorieRouter = require('./routes/categorie.routes')

app.use('/menu', menuRouter)
app.use('/commande', commandeRouter)
app.use('/stats', statsRouter)
app.use('/categorie', categorieRouter)

module.exports = app