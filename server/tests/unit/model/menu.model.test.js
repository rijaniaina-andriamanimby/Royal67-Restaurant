
jest.mock('../../../db/db');

const pool = require('../../../db/db');
const Menu = require('../../../model/menu.model');

describe('Menu model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Normalisation des espaces SQL
    const normalizeSQL = (sql) =>
        sql.replace(/\s+/g, ' ').trim();

    test('getAll returns rows with category information', async () => {
        const fakeRows = [
            {
                id: 1,
                nom: 'Riz',
                categorie: 'Plat',
                prix: 2000,
                cnom: 'Plat'
            }
        ];

        pool.query.mockResolvedValue({
            rows: fakeRows
        });

        const result = await Menu.getAll();

        expect(pool.query).toHaveBeenCalledTimes(1);

        const sql = normalizeSQL(
            pool.query.mock.calls[0][0]
        );

        expect(sql).toContain('FROM menu m');
        expect(sql).toContain('JOIN categorie c');
        expect(sql).toContain('ON c.id = m.categorie');

        expect(result).toEqual(fakeRows);
    });

    test('insert returns inserted row with category information', async () => {
        const inserted = {
            id: 2,
            nom: 'Poulet',
            categorie: 'Plat',
            prix: 3000,
            cnom: 'Plat'
        };

        pool.query
            .mockResolvedValueOnce({
                rows: [{ id: 2 }]
            })
            .mockResolvedValueOnce({
                rows: [inserted]
            });

        const res = await Menu.insert(
            'Poulet',
            'Plat',
            3000
        );

        expect(pool.query).toHaveBeenCalledTimes(2);

        const [insertSQL, insertParams] =
            pool.query.mock.calls[0];

        expect(normalizeSQL(insertSQL)).toBe(
            "INSERT INTO menu(nom, categorie, prix) VALUES ('Poulet', Plat, 3000) RETURNING id"
        );

        // La requête utilise l'interpolation :
        // aucun tableau de paramètres n'est transmis.
        expect(insertParams).toBeUndefined();

        const [selectSQL, selectParams] =
            pool.query.mock.calls[1];

        expect(normalizeSQL(selectSQL)).toContain(
            'JOIN categorie c ON c.id = m.categorie WHERE m.id = $1'
        );

        expect(selectParams).toEqual([2]);

        expect(res).toEqual(inserted);
    });

    test('update returns updated row with category information', async () => {
        const updated = {
            id: 2,
            nom: 'Poulet rôti',
            categorie: 'Plat',
            prix: 3500,
            cnom: 'Plat'
        };

        pool.query
            .mockResolvedValueOnce({
                rows: [{ id: 2 }]
            })
            .mockResolvedValueOnce({
                rows: [updated]
            });

        const res = await Menu.update(
            2,
            'Poulet rôti',
            'Plat',
            3500
        );

        expect(pool.query).toHaveBeenCalledTimes(2);

        const [updateSQL, updateParams] =
            pool.query.mock.calls[0];

        expect(normalizeSQL(updateSQL)).toBe(
            "UPDATE menu SET nom = 'Poulet rôti', categorie = Plat, prix = 3500 WHERE id = 2 RETURNING id"
        );

        expect(updateParams).toBeUndefined();

        const [selectSQL, selectParams] =
            pool.query.mock.calls[1];

        expect(normalizeSQL(selectSQL)).toContain(
            'JOIN categorie c ON c.id = m.categorie WHERE m.id = $1'
        );

        expect(selectParams).toEqual([2]);

        expect(res).toEqual(updated);
    });

    test('delete returns true when rowCount > 0', async () => {
        pool.query.mockResolvedValue({
            rowCount: 1
        });

        const ok = await Menu.delete(2);

        const [deleteSQL, deleteParams] =
            pool.query.mock.calls[0];

        expect(normalizeSQL(deleteSQL)).toBe(
            'DELETE FROM menu WHERE id = 2'
        );

        expect(deleteParams).toBeUndefined();

        expect(ok).toBe(true);
    });

    test('delete returns false when rowCount == 0', async () => {
        pool.query.mockResolvedValue({
            rowCount: 0
        });

        const ok = await Menu.delete(999);

        expect(normalizeSQL(pool.query.mock.calls[0][0])).toBe(
            'DELETE FROM menu WHERE id = 999'
        );

        expect(ok).toBe(false);
    });
});
