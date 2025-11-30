jest.mock('../../../db/db'); // mock du module pool
const pool = require('../../../db/db'); // le mock
const Menu = require('../../../model/menu.model');

describe('Menu model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAll returns rows', async () => {
    const fakeRows = [{ id:1, nom:'Riz', categorie:'Plat', prix:2000 }];
    pool.query.mockResolvedValue({ rows: fakeRows });

    const result = await Menu.getAll();
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM menu');
    expect(result).toEqual(fakeRows);
  });

  test('insert returns inserted row', async () => {
    const inserted = { id:2, nom:'Poulet', categorie:'Plat', prix:3000 };
    pool.query.mockResolvedValue({ rows: [inserted] });

    const res = await Menu.insert('Poulet', 'Plat', 3000);
    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO menu(nom, categorie, prix) VALUES ($1, $2, $3) RETURNING *',
      ['Poulet','Plat',3000]
    );
    expect(res).toEqual(inserted);
  });

  test('update returns updated row', async () => {
    const updated = { id:2, nom:'Poulet rôti', categorie:'Plat', prix:3500 };
    pool.query.mockResolvedValue({ rows: [updated] });

    const res = await Menu.update(2, 'Poulet rôti', 'Plat', 3500);
    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE menu SET nom= $1, categorie=$2, prix=$3 WHERE id=$4 RETURNING *',
      ['Poulet rôti','Plat',3500,2]
    );
    expect(res).toEqual(updated);
  });

  test('delete returns true when rowCount > 0', async () => {
    pool.query.mockResolvedValue({ rowCount: 1 });
    const ok = await Menu.delete(2);
    expect(pool.query).toHaveBeenCalledWith('DELETE FROM menu WHERE id=$1', [2]);
    expect(ok).toBe(true);
  });

  test('delete returns false when rowCount == 0', async () => {
    pool.query.mockResolvedValue({ rowCount: 0 });
    const ok = await Menu.delete(999);
    expect(ok).toBe(false);
  });
});
