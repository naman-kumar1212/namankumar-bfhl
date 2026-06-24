const {
  buildAdjacencyList,
  findConnectedComponents,
  detectCyclesPerComponent,
  identifyRoots,
  buildHierarchies,
  generateSummary,
} = require('../src/utils/graphUtils');

describe('graphUtils', () => {
  test('buildAdjacencyList correctly builds structures', () => {
    const validEdges = [
      { raw: "A->B", parsed: ["A", "B"] },
      { raw: "B->C", parsed: ["B", "C"] },
      { raw: "A->B", parsed: ["A", "B"] } // duplicate
    ];
    
    const { adjacencyList, nodes, dedupedEdges, duplicate_edges } = buildAdjacencyList(validEdges);
    
    expect(nodes.size).toBe(3);
    expect(dedupedEdges.length).toBe(2);
    expect(duplicate_edges).toEqual(["A->B"]);
    expect(adjacencyList.get('A')).toEqual(['B']);
    expect(adjacencyList.get('B')).toEqual(['C']);
  });

  test('detectCyclesPerComponent detects cycles correctly', () => {
    const edges = [
      { raw: "A->B", parsed: ["A", "B"] },
      { raw: "B->A", parsed: ["B", "A"] }
    ];
    const { adjacencyList, nodes, dedupedEdges } = buildAdjacencyList(edges);
    const components = findConnectedComponents(dedupedEdges, nodes);
    const { componentCycles, totalCycles } = detectCyclesPerComponent(adjacencyList, components);
    
    expect(totalCycles).toBe(1);
    expect(componentCycles.get(0)).toBe(true);
  });
  
  test('buildHierarchies correctly nests and calculates depth', () => {
    const edges = [
      { raw: "A->B", parsed: ["A", "B"] },
      { raw: "B->D", parsed: ["B", "D"] },
      { raw: "A->C", parsed: ["A", "C"] }
    ];
    
    const { adjacencyList, nodes, dedupedEdges } = buildAdjacencyList(edges);
    const components = findConnectedComponents(dedupedEdges, nodes);
    const { componentCycles } = detectCyclesPerComponent(adjacencyList, components);
    const componentRoots = identifyRoots(adjacencyList, components);
    
    const { hierarchies, totalTrees, largestTreeRoot } = buildHierarchies(
      componentRoots,
      adjacencyList,
      components,
      componentCycles
    );
    
    expect(totalTrees).toBe(1);
    expect(largestTreeRoot).toBe('A');
    expect(hierarchies[0].root).toBe('A');
    expect(hierarchies[0].depth).toBe(3);
    expect(hierarchies[0].tree).toEqual({ "A": { "B": { "D": {} }, "C": {} } });
  });

  test('generateSummary provides summary correctly', () => {
    const summary = generateSummary(3, 1, "A");
    expect(summary).toEqual({
      total_trees: 3,
      total_cycles: 1,
      largest_tree_root: "A"
    });
  });
});
