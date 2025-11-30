const request = require('supertest');
jest.mock('../../model/menu.model');
const Menu = require('../../model/menu.model');
const app = require('../../app'); // ton app express qui exporte app

describe('Menu routes', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET /menu -> 200 and array', async () => {
    const fake = [{ id:1, nom:'Riz' }];
    Menu.getAll.mockResolvedValue(fake);

    const res = await request(app).get('/menu');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(fake);
  });

  test('POST /menu -> 201 when valid', async () => {
    const created = { id:5, nom:'Jus', categorie:'Boisson', prix:800 };
    Menu.insert.mockResolvedValue(created);

    const res = await request(app)
      .post('/menu')
      .send({ nom:'Jus', categorie:'Boisson', prix:800 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(created);
  });

  test('PUT /menu/:id -> 200 when valid', async () => {
    const updated = { id:5, nom:'Jus Frais', categorie:'Boisson', prix:900 };
    Menu.update.mockResolvedValue(updated);

    const res = await request(app)
      .put('/menu/5')
      .send({ nom:'Jus Frais', categorie:'Boisson', prix:900 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(updated);
  });

  test('DELETE /menu/:id -> 204 when deleted', async () => {
    Menu.delete.mockResolvedValue(true);

    const res = await request(app).delete('/menu/5');
    expect(res.status).toBe(204);
  });
});
