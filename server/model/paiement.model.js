const pool = require('../db/db')

module.exports = {
    insert: async (payer, rendu, typePaiement, idCommande) => {
        const result = await pool.query('INSERT INTO paiement(payer, rendu, typePaiement, idCommande) VALUES ($1, $2, $3, $4) RETURNING *', [payer, rendu, typePaiement, idCommande])
        return result.rows[0]
    },
    
    getAll : async () => {
        const result = await pool.query('SELECT * FROM paiement')
        return result.rows
    }
}