/**
 * Jest test for backend routes.
 * Ensures that the Express.js/Fastify endpoints respond correctly.
 */

import request from 'supertest';
import { server } from '../../../../../backend/src/index'; // Adjust path as needed
import test, { describe } from 'node:test';

describe('Backend Routes', () => {
  afterAll(() => {
    server.close();
  });

  test('GET /health returns 200', async () => {
    const response = await request(server).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });
});
function afterAll(arg0: () => void) {
    throw new Error('Function not implemented.');
}

function expect(status: number) {
    throw new Error('Function not implemented.');
}

