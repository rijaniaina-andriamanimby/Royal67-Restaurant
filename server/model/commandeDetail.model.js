const pool = require('../db/db')

module.exports = {
    getAll: async () => {
        const result = await pool.query(`SELECT * FROM commandeDetail`)
        return result.rows
    },
    insert: async (idCommande, idMenu, quantite) => {
        const result = await pool.query(`INSERT INTO commandeDetail(idCommande, idMenu, quantite) VALUES ($1, $2, $3) RETURNING *`, [idCommande, idMenu, quantite])
        return result.rows[0]
    },
    delete: async (id) => {
        const result = await pool.query (`DELETE FROM commandeDetail WHERE id=$1`, [id])
        return result.rowCount > 0
    }
}