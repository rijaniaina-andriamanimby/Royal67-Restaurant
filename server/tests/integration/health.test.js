const request = require('supertest');

jest.mock('../../db/db', () => ({ query: jest.fn() }));
const db = require('../../db/db');
const app = require('../../app');

describe('GET /health', () => {
  afterEach(() => jest.clearAllMocks());

  test('returns 200 when PostgreSQL is reachable', async () => {
    db.query.mockResolvedValue({ rows: [{ '?column?': 1 }] });

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', database: 'connected' });
    expect(db.query).toHaveBeenCalledWith('SELECT 1');
  });

  test('returns 503 when PostgreSQL is unavailable', async () => {
    db.query.mockRejectedValue(new Error('database unavailable'));

    const response = await request(app).get('/health');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: 'error', database: 'unavailable' });
  });
});
