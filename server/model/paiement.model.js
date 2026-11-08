
const pool = require('../db/db')

module.exports = {
    // TP : SQL Injection
    insert: async (payer, rendu, typePaiement, idCommande) => {
        const query = `
            INSERT INTO paiement
                (payer, rendu, typepaiment, idcommande)
            VALUES
                (${payer}, ${rendu}, '${typePaiement}', ${idCommande})
            RETURNING *
        `

        const result = await pool.query(query)

        return result.rows[0]
    },

    // TN candidat : requête paramétrée, mais aucune
    // vérification métier des montants n'est effectuée.
    getAll: async () => {
        const result = await pool.query(
            'SELECT * FROM paiement'
        )

        return result.rows
    }
}
