const request = require('supertest');
const app = require('../src/app');

describe('BFHL Graph API', () => {
  describe('GET /bfhl', () => {
    it('should return operation_code: 1', async () => {
      const res = await request(app).get('/bfhl');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        operation_code: 1,
      });
    });
  });

  describe('POST /bfhl', () => {
    it('should correctly parse and process the exact assignment example', async () => {
      const payload = {
        data: [
          "A->B", "A->C", "B->D", "C->E", "E->F",
          "X->Y", "Y->Z", "Z->X",
          "P->Q", "Q->R",
          "G->H", "G->H", "G->I",
          "hello", "1->2", "A->"
        ]
      };

      const res = await request(app).post('/bfhl').send(payload);
      
      expect(res.statusCode).toBe(200);
      
      // Basic fields
      expect(res.body.user_id).toBe("johndoe_17091999");
      expect(res.body.email_id).toBe("john.doe@college.edu");
      expect(res.body.college_roll_number).toBe("21CS1001");
      
      // Invalid and duplicates
      expect(res.body.invalid_entries).toEqual(["hello", "1->2", "A->"]);
      expect(res.body.duplicate_edges).toEqual(["G->H"]);
      
      // Summary
      expect(res.body.summary).toEqual({
        total_trees: 3,
        total_cycles: 1,
        largest_tree_root: "A"
      });

      // Hierarchies
      expect(res.body.hierarchies).toHaveLength(4);
      
      const A = res.body.hierarchies.find(h => h.root === 'A');
      expect(A.depth).toBe(4);
      expect(A.tree).toEqual({ "A": { "B": { "D": {} }, "C": { "E": { "F": {} } } } });

      const X = res.body.hierarchies.find(h => h.root === 'X');
      expect(X.has_cycle).toBe(true);
      expect(X.tree).toEqual({});

      const P = res.body.hierarchies.find(h => h.root === 'P');
      expect(P.depth).toBe(3);
      expect(P.tree).toEqual({ "P": { "Q": { "R": {} } } });

      const G = res.body.hierarchies.find(h => h.root === 'G');
      expect(G.depth).toBe(2);
      expect(G.tree).toEqual({ "G": { "H": {}, "I": {} } });
    });

    it('should reject missing data field', async () => {
      const res = await request(app).post('/bfhl').send({ edges: [] });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });
});
