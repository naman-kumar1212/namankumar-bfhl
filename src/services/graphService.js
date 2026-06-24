/**
 * Graph processing service — orchestrator layer.
 *
 * Takes raw edges from the controller, runs the full analysis pipeline,
 * and returns a structured result object. The controller never calls
 * utility functions directly.
 */

const {
  buildAdjacencyList,
  detectCycles,
  findConnectedComponents,
  identifyRoots,
  buildTrees,
  calculateDepth,
  generateSummary,
} = require('../utils/graphUtils');

/**
 * Process a set of directed edges through the full graph analysis pipeline.
 *
 * Pipeline:
 *  1. Build adjacency list (with deduplication)
 *  2. Detect cycles
 *  3. Find connected components
 *  4. Identify roots per component
 *  5. Build trees from roots
 *  6. Calculate depths
 *  7. Generate human-readable summary
 *
 * @param {string[][]} edges - Raw edges from the request body
 * @returns {object} Complete analysis result
 */
function processGraph(edges) {
  // Step 1 — Adjacency list
  const { adjacencyList, nodes, dedupedEdges } = buildAdjacencyList(edges);

  // Step 2 — Cycle detection
  const cycleInfo = detectCycles(adjacencyList, nodes);

  // Step 3 — Connected components
  const components = findConnectedComponents(dedupedEdges, nodes);

  // Step 4 — Root identification
  const componentRoots = identifyRoots(adjacencyList, components);

  // Step 5 — Tree construction
  const trees = buildTrees(componentRoots, adjacencyList, components);

  // Step 6 — Depth calculation
  const depths = calculateDepth(trees);

  // Step 7 — Summary
  const summary = generateSummary({
    components,
    trees,
    cycleInfo,
    totalNodes: nodes.size,
    totalEdges: dedupedEdges.length,
  });

  return {
    totalNodes: nodes.size,
    totalEdges: dedupedEdges.length,
    duplicatesRemoved: edges.length - dedupedEdges.length,
    adjacencyList: Object.fromEntries(adjacencyList),
    cycleInfo: {
      hasCycle: cycleInfo.hasCycle,
      cycleEdges: cycleInfo.cycleEdges,
    },
    components,
    roots: Object.fromEntries(componentRoots),
    trees: trees.map(({ root, tree, depth, componentNodes }) => ({
      root,
      depth,
      componentNodes,
      tree,
    })),
    depths,
    summary,
  };
}

module.exports = { processGraph };
