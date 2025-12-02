jest.mock('../../../db/db')
const pool = require('../../../db/db'); // le mock
const Commande = require('../../../model/commande.model');

describe('Commande Model', () => {
    test('Insert commande -> return inserted ', async () => {
        const inserted = { id: 1, nomTable: 'Table 1' }
        pool.query.mockResolvedValue({ rows: [inserted] })

        const res = await Commande.insert('Table 1');
        expect(pool.query).toHaveBeenCalledWith(
            'INSERT INTO commande(nomTable) VALUES ($1) RETURNING *',
            ['Table 1']
        );
        expect(res).toEqual(inserted);
    })

    test('delete returns false when rowCount == 0', async () => {
        pool.query.mockResolvedValue({ rowCount: 0 });
        const ok = await Commande.delete(999);
        expect(ok).toBe(false);
    });

    test('Get * commande', async () => {
        const fakeRows = [{
            id: 4,
            nomtable: "Table 2",
            date: "2025-12-02T19:28:49.203Z",
            nom: "Soupe chinoise",
            prix: 1500,
            categorie: "Soupe",
            quantite: 5,
            payer: 20000,
            rendu: 10000,
            typepaiement: "Espèce"
        }];
        pool.query.mockResolvedValue({ rows: fakeRows });

        const result = await Commande.getAll();
        expect(pool.query).toHaveBeenCalledWith(
            `SELECT c.*,
            m.nom, m.prix,
            m.categorie, cd.quantite,
            p.payer, p.rendu, p.typePaiement
            FROM commandeDetail cd
            JOIN commande c ON c.id = cd.idCommande
            JOIN menu m ON m.id = cd.idMenu
            JOIN paiement p ON p.idCommande = c.id `
        );
        expect(result).toEqual(fakeRows)
    })

});
