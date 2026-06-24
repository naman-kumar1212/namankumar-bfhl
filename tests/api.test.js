/**
 * Integration tests for /bfhl endpoint (POST & GET)
 *
 * Tests the full request lifecycle:
 *  - POST /bfhl:
 *    - Valid payloads → 200 with correct graph structure and summary
 *    - Invalid payloads → 400 with error details
 *    - Edge cases (duplicates, cycles, disconnected, diamond)
 *  - GET /bfhl:
 *    - Returns status 200 with operation_code
 */

const request = require('supertest');
const app = require('../src/app');

describe('/bfhl Endpoint', () => {

  // ── GET /bfhl ──────────────────────────────────────────

  describe('GET /bfhl', () => {
    test('returns status 200 and operation code', async () => {
      const res = await request(app)
        .get('/bfhl')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.operation_code).toBe(1);
    });
  });

  // ── POST /bfhl ─────────────────────────────────────────

  describe('POST /bfhl', () => {

    // ── Validation Tests ────────────────────────────────

    describe('Input Validation', () => {
      test('rejects missing edges field', async () => {
        const res = await request(app)
          .post('/bfhl')
          .send({})
          .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('Validation failed');
      });

      test('rejects empty edges array', async () => {
        const res = await request(app)
          .post('/bfhl')
          .send({ edges: [] })
          .expect(400);

        expect(res.body.success).toBe(false);
      });

      test('rejects edges that are not arrays of 2', async () => {
        const res = await request(app)
          .post('/bfhl')
          .send({ edges: [['A']] })
          .expect(400);

        expect(res.body.success).toBe(false);
      });

      test('rejects non-string node values', async () => {
        const res = await request(app)
          .post('/bfhl')
          .send({ edges: [[1, 2]] })
          .expect(400);

        expect(res.body.success).toBe(false);
      });

      test('rejects self-loops', async () => {
        const res = await request(app)
          .post('/bfhl')
          .send({ edges: [['A', 'A']] })
          .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('Self-loops are not allowed');
      });
    });

    // ── Success Tests ───────────────────────────────────

    describe('Valid Graph Processing', () => {
      test('simple chain A→B→C', async () => {
        const res = await request(app)
          .post('/bfhl')
          .send({ edges: [['A', 'B'], ['B', 'C']] })
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.totalNodes).toBe(3);
        expect(res.body.data.totalEdges).toBe(2);
        expect(res.body.data.cycleInfo.hasCycle).toBe(false);
        expect(res.body.data.components).toHaveLength(1);
        expect(res.body.data.trees).toHaveLength(1);
        expect(res.body.data.trees[0].root).toBe('A');
        expect(res.body.data.trees[0].depth).toBe(2);
      });

      test('diamond DAG A→B, A→C, B→D, C→D', async () => {
        const res = await request(app)
          .post('/bfhl')
          .send({ edges: [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D']] })
          .expect(200);

        const data = res.body.data;
        expect(data.totalNodes).toBe(4);
        expect(data.cycleInfo.hasCycle).toBe(false);
        expect(data.trees[0].root).toBe('A');
      });

      test('graph with cycle A→B→C→A', async () => {
        const res = await request(app)
          .post('/bfhl')
          .send({ edges: [['A', 'B'], ['B', 'C'], ['C', 'A']] })
          .expect(200);

        const data = res.body.data;
        expect(data.cycleInfo.hasCycle).toBe(true);
        expect(data.cycleInfo.cycleEdges.length).toBeGreaterThanOrEqual(1);
      });

      test('duplicate edges are removed', async () => {
        const res = await request(app)
          .post('/bfhl')
          .send({ edges: [['A', 'B'], ['A', 'B'], ['B', 'C'], ['B', 'C']] })
          .expect(200);

        const data = res.body.data;
        expect(data.duplicatesRemoved).toBe(2);
        expect(data.totalEdges).toBe(2);
      });

      test('disconnected components', async () => {
        const res = await request(app)
          .post('/bfhl')
          .send({ edges: [['A', 'B'], ['C', 'D'], ['E', 'F']] })
          .expect(200);

        const data = res.body.data;
        expect(data.components).toHaveLength(3);
        expect(data.trees).toHaveLength(3);
      });

      test('summary is a non-empty string', async () => {
        const res = await request(app)
          .post('/bfhl')
          .send({ edges: [['A', 'B']] })
          .expect(200);

        expect(typeof res.body.data.summary).toBe('string');
        expect(res.body.data.summary.length).toBeGreaterThan(0);
      });
    });

    // ── Edge Cases ──────────────────────────────────────

    describe('Edge Cases', () => {
      test('single edge', async () => {
        const res = await request(app)
          .post('/bfhl')
          .send({ edges: [['X', 'Y']] })
          .expect(200);

        expect(res.body.data.totalNodes).toBe(2);
        expect(res.body.data.trees[0].depth).toBe(1);
      });

      test('large linear chain (100 nodes)', async () => {
        const edges = [];
        for (let i = 0; i < 99; i++) {
          edges.push([`N${i}`, `N${i + 1}`]);
        }

        const res = await request(app)
          .post('/bfhl')
          .send({ edges })
          .expect(200);

        expect(res.body.data.totalNodes).toBe(100);
        expect(res.body.data.trees[0].depth).toBe(99);
      });
    });
  });
});

// ── Health Check ────────────────────────────────────

describe('GET /', () => {
  test('returns health check response', async () => {
    const res = await request(app).get('/').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('running');
  });
});

// ── 404 ─────────────────────────────────────────────

describe('404 handling', () => {
  test('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown').expect(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('not found');
  });
});
