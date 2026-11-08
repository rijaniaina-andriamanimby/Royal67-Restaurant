
jest.mock('../../../db/db');

const pool = require('../../../db/db');
const Commande = require('../../../model/commande.model');

describe('Commande Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const normalizeSQL = (sql) =>
        sql.replace(/\s+/g, ' ').trim();

    test('Insert commande returns inserted row', async () => {
        const inserted = {
            id: 1,
            nomTable: 'Table 1'
        };

        pool.query.mockResolvedValue({
            rows: [inserted]
        });

        const res = await Commande.insert('Table 1');

        // Le modèle utilise maintenant une interpolation SQL.
        expect(pool.query).toHaveBeenCalledWith(
            "INSERT INTO commande(nomTable) VALUES ('Table 1') RETURNING *"
        );

        expect(pool.query).toHaveBeenCalledTimes(1);
        expect(res).toEqual(inserted);
    });

    test('delete returns false when rowCount == 0', async () => {
        pool.query.mockResolvedValue({
            rowCount: 0
        });

        const ok = await Commande.delete(999);

        expect(pool.query).toHaveBeenCalledWith(
            'DELETE FROM commande WHERE id = $1',
            [999]
        );

        expect(ok).toBe(false);
    });

    test('Get all commandes with menu and payment information', async () => {
        const fakeRows = [
            {
                id: 4,
                nomtable: 'Table 2',
                date: '2025-12-02T19:28:49.203Z',
                nom: 'Soupe chinoise',
                prix: 1500,
                categorie: 'Soupe',
                quantite: 5,
                payer: 20000,
                rendu: 10000,
                typepaiment: 'Espèce'
            }
        ];

        pool.query.mockResolvedValue({
            rows: fakeRows
        });

        const result = await Commande.getAll();

        expect(pool.query).toHaveBeenCalledTimes(1);

        const sql = normalizeSQL(
            pool.query.mock.calls[0][0]
        );

        expect(sql).toContain('SELECT c.*');
        expect(sql).toContain('m.nom, m.prix, m.categorie');
        expect(sql).toContain('cd.quantite');
        expect(sql).toContain('p.payer, p.rendu, p.typepaiment');

        expect(sql).toContain(
            'JOIN commande c ON c.id = cd.idCommande'
        );

        expect(sql).toContain(
            'JOIN menu m ON m.id = cd.idMenu'
        );

        expect(sql).toContain(
            'JOIN paiement p ON p.idcommande = c.id'
        );

        expect(result).toEqual(fakeRows);
    });
});
