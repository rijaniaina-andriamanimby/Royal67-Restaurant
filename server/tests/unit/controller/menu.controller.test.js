const httpMocks = require('node-mocks-http');
jest.mock('../../../model/menu.model'); // mock le modèle
const Menu = require('../../../model/menu.model');
const MenuController = require('../../../controller/menu.controller');

describe('MenuController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getMenu returns 200 with data', async () => {
    const fake = [{ id:1, nom:'Riz' }];
    Menu.getAll.mockResolvedValue(fake);

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await MenuController.getMenu(req, res);
    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data).toEqual(fake);
  });

  test('insert returns 201 when valid', async () => {
    const created = { id:3, nom:'Salade', categorie:'Entrée', prix:1500 };
    Menu.insert.mockResolvedValue(created);

    const req = httpMocks.createRequest({
      body: { nom:'Salade', categorie:'Entrée', prix:1500 }
    });
    const res = httpMocks.createResponse();

    await MenuController.insert(req, res);
    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toEqual(created);
  });

  test('insert throws TypeError when invalid payload', async () => {
    const req = httpMocks.createRequest({
      body: { nom:'', categorie:' ', prix:'not-a-number' }
    });
    const res = httpMocks.createResponse();

    await MenuController.insert(req, res);
    // ton code attrape l'erreur et renvoie 500 — on vérifie bien le status
    expect(res.statusCode).toBe(500);
    const body = res._getJSONData();
    expect(body).toHaveProperty('message');
  });

  test('update returns 200 when ok', async () => {
    const updated = { id:1, nom:'Riz spécial', categorie:'Plat', prix:2500 };
    Menu.update.mockResolvedValue(updated);

    const req = httpMocks.createRequest({
      params: { id: '1' },
      body: { nom:'Riz spécial', categorie:'Plat', prix:2500 }
    });
    const res = httpMocks.createResponse();

    await MenuController.update(req, res);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(updated);
  });

  test('delete returns 204 when deleted', async () => {
    Menu.delete.mockResolvedValue(true);

    const req = httpMocks.createRequest({ params: { id: '2' }});
    const res = httpMocks.createResponse();

    await MenuController.delete(req, res);
    expect(res.statusCode).toBe(204);
  });

  test('delete returns 400 when not deleted', async () => {
    Menu.delete.mockResolvedValue(false);

    const req = httpMocks.createRequest({ params: { id: '999' }});
    const res = httpMocks.createResponse();

    await MenuController.delete(req, res);
    expect(res.statusCode).toBe(400);
  });
});
