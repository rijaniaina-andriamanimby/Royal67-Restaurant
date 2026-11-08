
const pool = require('../db/db')

module.exports = {
    getAll: async () => {
        const result = await pool.query(
            'SELECT * FROM commandeDetail'
        )

        return result.rows
    },

    // TP : SQL Injection directe
    insert: async (idCommande, idMenu, quantite) => {
        const result = await pool.query(
            `INSERT INTO commandeDetail
            (idCommande, idMenu, quantite)
            VALUES (${idCommande}, ${idMenu}, ${quantite})
            RETURNING *`
        )

        return result.rows[0]
    },

    // FN potentiel : assemblage indirect de la requête
    search: async (idCommande) => {
        const fragments = [
            'SELECT * FROM commandeDetail WHERE idCommande = ',
            String(idCommande)
        ]

        const sql = fragments.join('')

        const result = await pool.query(sql)
        return result.rows
    },

    delete: async (id) => {
        const result = await pool.query(
            `DELETE FROM commandeDetail WHERE id=${id}`
        )

        return result.rowCount > 0
    }
}
