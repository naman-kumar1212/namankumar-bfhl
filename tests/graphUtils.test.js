/**
 * Unit tests for src/utils/graphUtils.js
 *
 * Test matrix:
 *  - Simple linear tree
 *  - Diamond DAG (multi-parent)
 *  - Cycle detection
 *  - Pure cycle (no root)
 *  - Disconnected components
 *  - Duplicate edge deduplication
 *  - Single node pair
 */

const {
  buildAdjacencyList,
  detectCycles,
  findConnectedComponents,
  identifyRoots,
  buildTree,
  buildTrees,
  calculateDepth,
  generateSummary,
} = require('../src/utils/graphUtils');

// ═══════════════════════════════════════════════════════
// 1. buildAdjacencyList
// ═══════════════════════════════════════════════════════

describe('buildAdjacencyList', () => {
  test('builds correct list for simple edges', () => {
    const edges = [['A', 'B'], ['B', 'C']];
    const { adjacencyList, nodes, dedupedEdges } = buildAdjacencyList(edges);

    expect(nodes.size).toBe(3);
    expect(adjacencyList.get('A')).toEqual(['B']);
    expect(adjacencyList.get('B')).toEqual(['C']);
    expect(adjacencyList.get('C')).toEqual([]);
    expect(dedupedEdges).toHaveLength(2);
  });

  test('deduplicates identical edges', () => {
    const edges = [['A', 'B'], ['A', 'B'], ['B', 'C'], ['B', 'C']];
    const { dedupedEdges, adjacencyList } = buildAdjacencyList(edges);

    expect(dedupedEdges).toHaveLength(2);
    expect(adjacencyList.get('A')).toEqual(['B']);
  });

  test('treats A→B and B→A as different edges', () => {
    const edges = [['A', 'B'], ['B', 'A']];
    const { dedupedEdges } = buildAdjacencyList(edges);

    expect(dedupedEdges).toHaveLength(2);
  });
});

// ═══════════════════════════════════════════════════════
// 2. detectCycles
// ═══════════════════════════════════════════════════════

describe('detectCycles', () => {
  test('no cycle in a linear chain', () => {
    const edges = [['A', 'B'], ['B', 'C']];
    const { adjacencyList, nodes } = buildAdjacencyList(edges);
    const { hasCycle } = detectCycles(adjacencyList, nodes);

    expect(hasCycle).toBe(false);
  });

  test('detects simple cycle A→B→C→A', () => {
    const edges = [['A', 'B'], ['B', 'C'], ['C', 'A']];
    const { adjacencyList, nodes } = buildAdjacencyList(edges);
    const { hasCycle, cycleEdges } = detectCycles(adjacencyList, nodes);

    expect(hasCycle).toBe(true);
    expect(cycleEdges.length).toBeGreaterThanOrEqual(1);
  });

  test('no cycle in diamond DAG', () => {
    const edges = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D']];
    const { adjacencyList, nodes } = buildAdjacencyList(edges);
    const { hasCycle } = detectCycles(adjacencyList, nodes);

    expect(hasCycle).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════
// 3. findConnectedComponents
// ═══════════════════════════════════════════════════════

describe('findConnectedComponents', () => {
  test('single component', () => {
    const edges = [['A', 'B'], ['B', 'C']];
    const { nodes, dedupedEdges } = buildAdjacencyList(edges);
    const components = findConnectedComponents(dedupedEdges, nodes);

    expect(components).toHaveLength(1);
    expect(components[0].sort()).toEqual(['A', 'B', 'C']);
  });

  test('two disconnected components', () => {
    const edges = [['A', 'B'], ['C', 'D']];
    const { nodes, dedupedEdges } = buildAdjacencyList(edges);
    const components = findConnectedComponents(dedupedEdges, nodes);

    expect(components).toHaveLength(2);
  });

  test('three separate pairs', () => {
    const edges = [['A', 'B'], ['C', 'D'], ['E', 'F']];
    const { nodes, dedupedEdges } = buildAdjacencyList(edges);
    const components = findConnectedComponents(dedupedEdges, nodes);

    expect(components).toHaveLength(3);
  });
});

// ═══════════════════════════════════════════════════════
// 4. identifyRoots
// ═══════════════════════════════════════════════════════

describe('identifyRoots', () => {
  test('identifies root with in-degree 0', () => {
    const edges = [['A', 'B'], ['B', 'C']];
    const { adjacencyList, nodes, dedupedEdges } = buildAdjacencyList(edges);
    const components = findConnectedComponents(dedupedEdges, nodes);
    const roots = identifyRoots(adjacencyList, components);

    expect(roots.get(0)).toEqual(['A']);
  });

  test('pure cycle picks lexicographically smallest', () => {
    const edges = [['C', 'A'], ['A', 'B'], ['B', 'C']];
    const { adjacencyList, nodes, dedupedEdges } = buildAdjacencyList(edges);
    const components = findConnectedComponents(dedupedEdges, nodes);
    const roots = identifyRoots(adjacencyList, components);

    // All nodes have in-degree 1, so pick smallest = 'A'
    expect(roots.get(0)).toEqual(['A']);
  });

  test('diamond DAG has single root', () => {
    const edges = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D']];
    const { adjacencyList, nodes, dedupedEdges } = buildAdjacencyList(edges);
    const components = findConnectedComponents(dedupedEdges, nodes);
    const roots = identifyRoots(adjacencyList, components);

    expect(roots.get(0)).toEqual(['A']);
  });
});

// ═══════════════════════════════════════════════════════
// 5. buildTree / buildTrees
// ═══════════════════════════════════════════════════════

describe('buildTree', () => {
  test('simple chain A→B→C', () => {
    const edges = [['A', 'B'], ['B', 'C']];
    const { adjacencyList } = buildAdjacencyList(edges);
    const { tree, depth } = buildTree('A', adjacencyList);

    expect(tree.name).toBe('A');
    expect(tree.children[0].name).toBe('B');
    expect(tree.children[0].children[0].name).toBe('C');
    expect(depth).toBe(2);
  });

  test('diamond DAG — D appears once with children, once as back-ref', () => {
    const edges = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D']];
    const { adjacencyList } = buildAdjacencyList(edges);
    const { tree } = buildTree('A', adjacencyList);

    // A has two children: B and C
    expect(tree.children).toHaveLength(2);

    // One path reaches D first, the other sees it as already visited
    const allDs = JSON.stringify(tree).match(/"name":"D"/g);
    expect(allDs.length).toBe(2); // D appears twice — once real, once as cycleBackRef
  });

  test('cycle produces cycleBackRef marker', () => {
    const edges = [['A', 'B'], ['B', 'A']];
    const { adjacencyList } = buildAdjacencyList(edges);
    const { tree } = buildTree('A', adjacencyList);

    // A → B → A(backRef)
    expect(tree.children[0].children[0].cycleBackRef).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════
// 6. calculateDepth
// ═══════════════════════════════════════════════════════

describe('calculateDepth', () => {
  test('returns correct depths', () => {
    const trees = [
      { root: 'A', depth: 3 },
      { root: 'X', depth: 1 },
    ];
    const depths = calculateDepth(trees);

    expect(depths).toEqual([
      { root: 'A', depth: 3 },
      { root: 'X', depth: 1 },
    ]);
  });
});

// ═══════════════════════════════════════════════════════
// 7. generateSummary
// ═══════════════════════════════════════════════════════

describe('generateSummary', () => {
  test('includes key information', () => {
    const summary = generateSummary({
      components: [['A', 'B', 'C']],
      trees: [{ root: 'A', depth: 2, componentNodes: ['A', 'B', 'C'] }],
      cycleInfo: { hasCycle: false, cycleEdges: [] },
      totalNodes: 3,
      totalEdges: 2,
    });

    expect(summary).toContain('Total nodes: 3');
    expect(summary).toContain('Total unique edges: 2');
    expect(summary).toContain('Connected components: 1');
    expect(summary).toContain('Cycles detected: No');
    expect(summary).toContain('root="A"');
  });

  test('includes cycle info when cycles exist', () => {
    const summary = generateSummary({
      components: [['A', 'B']],
      trees: [{ root: 'A', depth: 1, componentNodes: ['A', 'B'] }],
      cycleInfo: { hasCycle: true, cycleEdges: [['B', 'A']] },
      totalNodes: 2,
      totalEdges: 2,
    });

    expect(summary).toContain('Cycles detected: Yes');
    expect(summary).toContain('B → A');
  });
});
