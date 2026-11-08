
const pool = require('../db/db')
const { update } = require('./menu.model')

module.exports = {
    getAll: async () => {
        const response = await pool.query('SELECT * FROM categorie')
        return response.rows
    },

    // TP : SQL Injection directe
    add: async (nom) => {
        const response = await pool.query(
            `INSERT INTO categorie (nom) VALUES ('${nom}') RETURNING *`
        )
        return response.rows[0]
    },

    // TP : SQL Injection dans UPDATE
    update: async (id, nom) => {
        const response = await pool.query(
            `UPDATE categorie SET nom='${nom}' WHERE id=${id} RETURNING *`
        )
        return response.rows[0]
    },

    // FN potentiel : construction dynamique indirecte
    search: async (nom) => {
        const queryParts = [
            'SELECT * FROM categorie WHERE nom = ',
            "'" + nom + "'"
        ]

        const query = queryParts.join('')

        const response = await pool.query(query)
        return response.rows
    },

    delete: async (id) => {
        const response = await pool.query(
            'DELETE FROM categorie WHERE id=$1',
            [id]
        )
        return response.rowCount > 0
    }
}
