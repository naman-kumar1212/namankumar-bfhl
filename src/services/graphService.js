const {
  buildAdjacencyList,
  findConnectedComponents,
  detectCyclesPerComponent,
  identifyRoots,
  buildHierarchies,
  generateSummary,
} = require('../utils/graphUtils');

function processGraph(validEdges, invalid_entries) {
  // Step 1 — Adjacency list and duplicate detection
  const { adjacencyList, nodes, dedupedEdges, duplicate_edges } = buildAdjacencyList(validEdges);

  // Step 2 — Connected components
  const components = findConnectedComponents(dedupedEdges, nodes);

  // Step 3 — Cycle detection per component
  const { componentCycles, totalCycles } = detectCyclesPerComponent(adjacencyList, components);

  // Step 4 — Root identification
  const componentRoots = identifyRoots(adjacencyList, components);

  // Step 5 — Build hierarchies (trees or cycles)
  const { hierarchies, totalTrees, largestTreeRoot } = buildHierarchies(
    componentRoots,
    adjacencyList,
    components,
    componentCycles
  );

  // Step 6 — Summary
  const summary = generateSummary(totalTrees, totalCycles, largestTreeRoot);

  return {
    user_id: "namankumar_12122004",
    email_id: "naman1910.be23@chitkara.edu.in",
    college_roll_number: "2310991910",
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary
  };
}

module.exports = { processGraph };
