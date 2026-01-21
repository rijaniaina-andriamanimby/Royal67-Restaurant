const pool = require("../db/db")

module.exports = {
  getTotals: async () => {
    const result = await pool.query(`
      SELECT 
        SUM(m.prix * cd.quantite) AS total_global,
        SUM(
          CASE 
            WHEN DATE_TRUNC('month', c.date) = DATE_TRUNC('month', NOW()) 
            THEN m.prix * cd.quantite 
            ELSE 0 
          END
        ) AS total_mois,
        COUNT(DISTINCT c.id) AS total_commandes
      FROM commande c
      JOIN commandeDetail cd ON cd.idCommande = c.id
      JOIN menu m ON m.id = cd.idMenu
    `)
    return result.rows[0]
  },

  getTopMenusWeek: async () => {
    const result = await pool.query(`
      SELECT m.nom, SUM(cd.quantite) AS total
      FROM commandeDetail cd
      JOIN commande c ON c.id = cd.idCommande
      JOIN menu m ON m.id = cd.idMenu
      WHERE c.date >= NOW() - INTERVAL '7 days'
      GROUP BY m.nom
      ORDER BY total DESC
      LIMIT 5
    `)
    return result.rows
  },

  // Filtre dynamique par période
  getSalesByPeriod: async (start, end) => {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(c.date, 'YYYY-MM-DD') AS jour,
        SUM(m.prix * cd.quantite)::INT AS total
      FROM commande c
      JOIN commandeDetail cd ON cd.idCommande = c.id
      JOIN menu m ON m.id = cd.idMenu
      WHERE c.date BETWEEN $1 AND $2
      GROUP BY jour
      ORDER BY jour ASC
    `, [start, end])
    return result.rows
  },

  // Statistiques par catégorie
  getSalesByCategory: async () => {
    const result = await pool.query(`
      SELECT m.categorie, SUM(cd.quantite) AS total
      FROM commandeDetail cd
      JOIN menu m ON m.id = cd.idMenu
      GROUP BY m.categorie
      ORDER BY total DESC
    `)
    return result.rows
  },

  // Historique des paiements
  getPaymentsHistory: async () => {
    const result = await pool.query(`
      SELECT 
        c.nomTable,
        p.payer,
        p.rendu,
        p.typePaiement,
        c.date
      FROM paiement p
      JOIN commande c ON c.id = p.idCommande
      ORDER BY c.date DESC
    `)
    return result.rows
  }
}
