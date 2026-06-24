/**
 * Graph utility functions — pure, stateless, fully tested.
 *
 * Algorithms:
 *  1. buildAdjacencyList  — deduplicate edges, build directed adjacency map
 *  2. detectCycles        — DFS 3-colour cycle detection
 *  3. findConnectedComponents — Union-Find on undirected view
 *  4. identifyRoots       — in-degree 0 nodes; fallback for pure cycles
 *  5. buildTrees          — BFS from each root to produce nested tree JSON
 *  6. calculateDepth      — max depth of each tree
 *  7. generateSummary     — human-readable summary string
 */

// ═══════════════════════════════════════════════════════
// 1. BUILD ADJACENCY LIST (with deduplication)
// ═══════════════════════════════════════════════════════

/**
 * Builds a directed adjacency list from an array of edges.
 * Duplicate edges are silently removed.
 *
 * @param {string[][]} edges - Array of [from, to] pairs
 * @returns {{ adjacencyList: Map<string, string[]>, nodes: Set<string>, dedupedEdges: string[][] }}
 */
function buildAdjacencyList(edges) {
  const adjacencyList = new Map();
  const nodes = new Set();
  const seen = new Set(); // for deduplication
  const dedupedEdges = [];

  for (const [from, to] of edges) {
    const key = `${from}->${to}`;
    if (seen.has(key)) continue;
    seen.add(key);
    dedupedEdges.push([from, to]);

    nodes.add(from);
    nodes.add(to);

    if (!adjacencyList.has(from)) adjacencyList.set(from, []);
    adjacencyList.get(from).push(to);

    // Ensure 'to' node exists in the map even if it has no children
    if (!adjacencyList.has(to)) adjacencyList.set(to, []);
  }

  return { adjacencyList, nodes, dedupedEdges };
}

// ═══════════════════════════════════════════════════════
// 2. DETECT CYCLES (DFS 3-colour)
// ═══════════════════════════════════════════════════════

/**
 * Detects cycles in a directed graph using DFS with 3-colour marking.
 *  WHITE (0) = unvisited
 *  GRAY  (1) = in current DFS stack (visiting)
 *  BLACK (2) = fully processed
 *
 * A back-edge (to a GRAY node) indicates a cycle.
 *
 * @param {Map<string, string[]>} adjacencyList
 * @param {Set<string>} nodes
 * @returns {{ hasCycle: boolean, cycleEdges: string[][] }}
 */
function detectCycles(adjacencyList, nodes) {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const colour = new Map();
  const cycleEdges = [];
  let hasCycle = false;

  for (const node of nodes) {
    colour.set(node, WHITE);
  }

  function dfs(u) {
    colour.set(u, GRAY);
    const neighbours = adjacencyList.get(u) || [];
    for (const v of neighbours) {
      if (colour.get(v) === GRAY) {
        // Back edge → cycle detected
        hasCycle = true;
        cycleEdges.push([u, v]);
      } else if (colour.get(v) === WHITE) {
        dfs(v);
      }
    }
    colour.set(u, BLACK);
  }

  for (const node of nodes) {
    if (colour.get(node) === WHITE) {
      dfs(node);
    }
  }

  return { hasCycle, cycleEdges };
}

// ═══════════════════════════════════════════════════════
// 3. FIND CONNECTED COMPONENTS (Union-Find)
// ═══════════════════════════════════════════════════════

/**
 * Groups nodes into connected components using Union-Find.
 * Treats the graph as UNDIRECTED for connectivity.
 *
 * @param {string[][]} edges - Deduplicated edges
 * @param {Set<string>} nodes
 * @returns {string[][]} Array of components, each an array of node names (sorted)
 */
function findConnectedComponents(edges, nodes) {
  const parent = new Map();
  const rank = new Map();

  // Initialise each node as its own parent
  for (const node of nodes) {
    parent.set(node, node);
    rank.set(node, 0);
  }

  function find(x) {
    if (parent.get(x) !== x) {
      parent.set(x, find(parent.get(x))); // path compression
    }
    return parent.get(x);
  }

  function union(a, b) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA === rootB) return;
    // Union by rank
    if (rank.get(rootA) < rank.get(rootB)) {
      parent.set(rootA, rootB);
    } else if (rank.get(rootA) > rank.get(rootB)) {
      parent.set(rootB, rootA);
    } else {
      parent.set(rootB, rootA);
      rank.set(rootA, rank.get(rootA) + 1);
    }
  }

  // Union all edges (undirected)
  for (const [from, to] of edges) {
    union(from, to);
  }

  // Group by root
  const groups = new Map();
  for (const node of nodes) {
    const root = find(node);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(node);
  }

  // Sort nodes within each component and return
  const components = [];
  for (const members of groups.values()) {
    components.push(members.sort());
  }

  // Sort components by their first element for deterministic output
  components.sort((a, b) => a[0].localeCompare(b[0]));

  return components;
}

// ═══════════════════════════════════════════════════════
// 4. IDENTIFY ROOTS
// ═══════════════════════════════════════════════════════

/**
 * Identifies root nodes for each connected component.
 *
 * Rules:
 *  - A root is a node with in-degree 0 within its component.
 *  - If NO node has in-degree 0 (pure cycle), pick the
 *    lexicographically smallest node as the root.
 *
 * @param {Map<string, string[]>} adjacencyList
 * @param {string[][]} components
 * @returns {Map<string, string[]>} componentIndex → root nodes
 */
function identifyRoots(adjacencyList, components) {
  // Calculate in-degree for all nodes
  const inDegree = new Map();
  for (const [, neighbours] of adjacencyList) {
    for (const neighbour of neighbours) {
      inDegree.set(neighbour, (inDegree.get(neighbour) || 0) + 1);
    }
  }

  const componentRoots = new Map();

  components.forEach((component, index) => {
    const roots = component.filter(
      (node) => (inDegree.get(node) || 0) === 0
    );

    if (roots.length > 0) {
      // Sort for deterministic order
      componentRoots.set(index, roots.sort());
    } else {
      // Pure cycle — pick lexicographically smallest
      const sorted = [...component].sort();
      componentRoots.set(index, [sorted[0]]);
    }
  });

  return componentRoots;
}

// ═══════════════════════════════════════════════════════
// 5. BUILD TREES (BFS from each root)
// ═══════════════════════════════════════════════════════

/**
 * Builds a nested tree structure via BFS from a given root.
 * Handles diamond cases (multi-parent): a node appears under the
 * FIRST parent that reaches it, with a note for subsequent parents.
 *
 * For cycles: if we encounter an already-visited node, we mark it
 * as a cycle-back-reference instead of recursing.
 *
 * @param {string} root
 * @param {Map<string, string[]>} adjacencyList
 * @returns {{ tree: object, depth: number }}
 */
function buildTree(root, adjacencyList) {
  const visited = new Set();
  let maxDepth = 0;

  function dfs(node, depth) {
    if (visited.has(node)) {
      return { name: node, cycleBackRef: true };
    }

    visited.add(node);
    if (depth > maxDepth) maxDepth = depth;

    const neighbours = adjacencyList.get(node) || [];
    const children = [];

    for (const child of neighbours) {
      children.push(dfs(child, depth + 1));
    }

    const treeNode = { name: node };
    if (children.length > 0) {
      treeNode.children = children;
    }

    return treeNode;
  }

  const tree = dfs(root, 0);
  return { tree, depth: maxDepth };
}

/**
 * Builds trees for ALL roots across all components.
 *
 * @param {Map<string, string[]>} componentRoots - index → root nodes
 * @param {Map<string, string[]>} adjacencyList
 * @param {string[][]} components
 * @returns {object[]} Array of { componentIndex, root, tree, depth }
 */
function buildTrees(componentRoots, adjacencyList, components) {
  const results = [];

  for (const [compIndex, roots] of componentRoots) {
    for (const root of roots) {
      const { tree, depth } = buildTree(root, adjacencyList);
      results.push({
        componentIndex: compIndex,
        componentNodes: components[compIndex],
        root,
        tree,
        depth,
      });
    }
  }

  return results;
}

// ═══════════════════════════════════════════════════════
// 6. CALCULATE DEPTH (convenience — already computed in buildTree)
// ═══════════════════════════════════════════════════════

/**
 * Extracts a depth map from built trees.
 *
 * @param {object[]} trees - Output of buildTrees()
 * @returns {object[]} Array of { root, depth }
 */
function calculateDepth(trees) {
  return trees.map(({ root, depth }) => ({ root, depth }));
}

// ═══════════════════════════════════════════════════════
// 7. GENERATE SUMMARY
// ═══════════════════════════════════════════════════════

/**
 * Produces a human-readable summary of the graph analysis.
 *
 * @param {object} data - { components, trees, cycleInfo }
 * @returns {string}
 */
function generateSummary({ components, trees, cycleInfo, totalNodes, totalEdges }) {
  const lines = [];

  lines.push(`Graph Analysis Summary`);
  lines.push(`======================`);
  lines.push(`Total nodes: ${totalNodes}`);
  lines.push(`Total unique edges: ${totalEdges}`);
  lines.push(`Connected components: ${components.length}`);
  lines.push(`Cycles detected: ${cycleInfo.hasCycle ? 'Yes' : 'No'}`);

  if (cycleInfo.hasCycle) {
    lines.push(`Cycle edges: ${cycleInfo.cycleEdges.map(([a, b]) => `${a} → ${b}`).join(', ')}`);
  }

  lines.push('');

  trees.forEach(({ root, depth, componentNodes }, i) => {
    lines.push(`Tree ${i + 1}: root="${root}", depth=${depth}, component=[${componentNodes.join(', ')}]`);
  });

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════

module.exports = {
  buildAdjacencyList,
  detectCycles,
  findConnectedComponents,
  identifyRoots,
  buildTree,
  buildTrees,
  calculateDepth,
  generateSummary,
};
