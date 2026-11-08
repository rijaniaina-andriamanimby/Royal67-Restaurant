
const pool = require('../db/db')

module.exports = {
    getAll: async () => {
        const result = await pool.query(`
            SELECT
                c.*,
                m.nom,
                m.prix,
                m.categorie,
                cd.quantite,
                p.payer,
                p.rendu,
                p.typepaiment
            FROM commandeDetail cd
            JOIN commande c ON c.id = cd.idCommande
            JOIN menu m ON m.id = cd.idMenu
            JOIN paiement p ON p.idcommande = c.id
        `)

        return result.rows
    },

    // TP : SQL Injection directe
    insert: async (nomTable) => {
        const result = await pool.query(
            `INSERT INTO commande(nomTable) VALUES ('${nomTable}') RETURNING *`
        )

        return result.rows[0]
    },

    // FN potentiel : construction de requête dynamique
    search: async (nomTable) => {
        const conditions = []
        conditions.push("nomTable = '" + nomTable + "'")

        const sql = 'SELECT * FROM commande WHERE ' + conditions.join(' AND ')

        const result = await pool.query(sql)
        return result.rows
    },

    delete: async (id) => {
        const response = await pool.query(
            'DELETE FROM commande WHERE id = $1',
            [id]
        )

        return response.rowCount > 0
    }
}
