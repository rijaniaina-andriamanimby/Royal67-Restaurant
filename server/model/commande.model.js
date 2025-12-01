const pool = require('../db/db')

module.exports = {
    getAll : async () => {
        const result = await pool.query(
            `SELECT c.*,
            m.nom, m.prix,
            m.categorie, cd.quantite 
            FROM commandeDetail cd
            JOIN commande c ON c.id = cd.idCommande
            JOIN menu m ON m.id = cd.idMenu`
        )
        return result.rows
    },
    insert : async (nomTable) => {
        const result = await pool.query("INSERT INTO commande(nomTable) VALUES ($1) RETURNING *", [nomTable])
        return result.rows[0]
    },
    delete : async (id) => {
        const response = await pool.query(`DELETE FROM commande WHERE id=$1`, [id])
        return response.rowCount > 0
    }
}