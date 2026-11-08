
const pool = require("../db/db");

module.exports = {
    getTotals: async () => {
        const result = await pool.query(`
            SELECT
                COALESCE(
                    SUM(m.prix * cd.quantite),
                    0
                ) AS total_global,

                COALESCE(
                    SUM(
                        CASE
                            WHEN DATE_TRUNC('month', c.date) =
                                 DATE_TRUNC('month', NOW())
                            THEN m.prix * cd.quantite
                            ELSE 0
                        END
                    ),
                    0
                ) AS total_mois,

                COUNT(DISTINCT c.id) AS total_commandes

            FROM commande c
            JOIN commandeDetail cd
                ON cd.idCommande = c.id
            JOIN menu m
                ON m.id = cd.idMenu
        `);

        return result.rows[0];
    },

    getTopMenusWeek: async () => {
        const result = await pool.query(`
            SELECT
                m.nom,
                SUM(cd.quantite) AS total

            FROM commandeDetail cd

            JOIN commande c
                ON c.id = cd.idCommande

            JOIN menu m
                ON m.id = cd.idMenu

            WHERE c.date >= NOW() - INTERVAL '7 days'

            GROUP BY m.nom

            ORDER BY total DESC

            LIMIT 5
        `);

        return result.rows;
    },

    // TP : SQL Injection - dates interpolées
    getSalesByPeriod: async (start, end) => {
        const query = `
            SELECT
                TO_CHAR(c.date, 'YYYY-MM-DD') AS jour,
                SUM(m.prix * cd.quantite)::INT AS total

            FROM commande c

            JOIN commandeDetail cd
                ON cd.idCommande = c.id

            JOIN menu m
                ON m.id = cd.idMenu

            WHERE c.date BETWEEN '${start}' AND '${end}'

            GROUP BY jour

            ORDER BY jour ASC
        `;

        const result = await pool.query(query);

        return result.rows;
    },

    getSalesByCategory: async () => {
        const result = await pool.query(`
            SELECT
                m.categorie,
                SUM(cd.quantite) AS total

            FROM commandeDetail cd

            JOIN menu m
                ON m.id = cd.idMenu

            GROUP BY m.categorie

            ORDER BY total DESC
        `);

        return result.rows;
    },

    getPaymentsHistory: async () => {
        const result = await pool.query(`
            SELECT
                c.nomTable,
                p.payer,
                p.rendu,
                p.typepaiment,
                c.date

            FROM paiement p

            JOIN commande c
                ON c.id = p.idcommande

            ORDER BY c.date DESC
        `);

        return result.rows;
    },
};
