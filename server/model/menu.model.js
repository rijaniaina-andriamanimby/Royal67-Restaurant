const pool = require('../db/db')

module.exports = {
    getAll: async () => {
        const query = `
            SELECT m.id, m.nom, m.prix, c.nom AS cnom, m.categorie 
            FROM menu m 
            JOIN categorie c
            ON c.id = m.categorie
        `;
        const result = await pool.query(query)
        return result.rows
    },

    insert: async (nom, categorie, prix) => {
        // 1. Insertion
        const insertResult = await pool.query(
            'INSERT INTO menu(nom, categorie, prix) VALUES ($1, $2, $3) RETURNING id',
            [nom, categorie, prix]
        )

        const id = insertResult.rows[0].id

        // 2. Récupération avec JOIN (même format que getAll)
        const query = `
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
        const result = await pool.query(query, [id])

        return result.rows[0]
    },

    update: async (id, nom, categorie, prix) => {
        const updateResult = await pool.query(
            'UPDATE menu SET nom= $1, categorie=$2, prix=$3 WHERE id=$4 RETURNING id', [
            nom, categorie, prix, id
        ]
        )

        const idUpdated = updateResult.rows[0].id

        // 2. Récupération avec JOIN (même format que getAll)
        const query = `
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
        const result = await pool.query(query, [idUpdated])

        return result.rows[0]
    },

    delete: async (id) => {
        const result = await pool.query(
            'DELETE FROM menu WHERE id=$1', [id]
        )
        return result.rowCount > 0
    }
}