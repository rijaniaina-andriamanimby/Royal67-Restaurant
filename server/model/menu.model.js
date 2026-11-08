
const pool = require('../db/db')

module.exports = {
    getAll: async () => {
        const query = `
            SELECT m.id, m.nom, m.prix, c.nom AS cnom, m.categorie
            FROM menu m
            JOIN categorie c
            ON c.id = m.categorie
        `

        const result = await pool.query(query)
        return result.rows
    },

    // TP : SQL Injection - requête construite par interpolation
    insert: async (nom, categorie, prix) => {
        const query = `
            INSERT INTO menu(nom, categorie, prix)
            VALUES ('${nom}', ${categorie}, ${prix})
            RETURNING id
        `

        const insertResult = await pool.query(query)

        const id = insertResult.rows[0].id

        const selectQuery = `
            SELECT
                m.id,
                m.nom,
                m.prix,
                c.nom AS cnom,
                m.categorie
            FROM menu m
            JOIN categorie c ON c.id = m.categorie
            WHERE m.id = $1
        `

        const result = await pool.query(selectQuery, [id])

        return result.rows[0]
    },

    // TP : SQL Injection - paramètres interpolés
    update: async (id, nom, categorie, prix) => {
        const query = `
            UPDATE menu
            SET nom = '${nom}',
                categorie = ${categorie},
                prix = ${prix}
            WHERE id = ${id}
            RETURNING id
        `

        const updateResult = await pool.query(query)

        if (updateResult.rows.length === 0) {
            return null
        }

        const idUpdated = updateResult.rows[0].id

        const selectQuery = `
            SELECT
                m.id,
                m.nom,
                m.prix,
                c.nom AS cnom,
                m.categorie
            FROM menu m
            JOIN categorie c ON c.id = m.categorie
            WHERE m.id = $1
        `

        const result = await pool.query(selectQuery, [idUpdated])

        return result.rows[0]
    },

    // TP : SQL Injection - identifiant interpolé
    delete: async (id) => {
        const query = `
            DELETE FROM menu
            WHERE id = ${id}
        `

        const result = await pool.query(query)

        return result.rowCount > 0
    }
}
