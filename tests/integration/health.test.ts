import request from 'supertest';
import { createApp } from '@/app';

/**
 * Minimal integration test that verifies the app boots and the health
 * endpoint responds correctly. Does not require a database connection.
 */
describe('GET /api/v1/health', () => {
  const app = createApp();

  it('should return 200 with success: true', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('OK');
  });

  it('should return 404 for an unknown route', async () => {
    const res = await request(app).get('/api/v1/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
