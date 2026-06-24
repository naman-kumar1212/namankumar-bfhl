/**
 * Graph utility functions for BFHL Challenge.
 */

function buildAdjacencyList(edges) {
  const adjacencyList = new Map();
  const nodes = new Set();
  const seenRaw = new Set();
  const childHasParent = new Map();
  const duplicate_edges = [];
  const dedupedEdges = [];

  for (const edge of edges) {
    const from = edge.parsed[0];
    const to = edge.parsed[1];
    
    // Store duplicates based on raw string
    if (seenRaw.has(edge.raw)) {
      if (!duplicate_edges.includes(edge.raw)) {
        duplicate_edges.push(edge.raw);
      }
      continue;
    }
    seenRaw.add(edge.raw);
    
    // Diamond / multi-parent rule
    if (childHasParent.has(to) && childHasParent.get(to) !== from) {
      continue;
    }
    childHasParent.set(to, from);

    dedupedEdges.push([from, to]);

    nodes.add(from);
    nodes.add(to);

    if (!adjacencyList.has(from)) adjacencyList.set(from, []);
    adjacencyList.get(from).push(to);

    if (!adjacencyList.has(to)) adjacencyList.set(to, []);
  }

  return { adjacencyList, nodes, dedupedEdges, duplicate_edges };
}

function findConnectedComponents(edges, nodes) {
  const parent = new Map();
  const rank = new Map();

  for (const node of nodes) {
    parent.set(node, node);
    rank.set(node, 0);
  }

  function find(x) {
    if (parent.get(x) !== x) {
      parent.set(x, find(parent.get(x)));
    }
    return parent.get(x);
  }

  function union(a, b) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA === rootB) return;
    if (rank.get(rootA) < rank.get(rootB)) {
      parent.set(rootA, rootB);
    } else if (rank.get(rootA) > rank.get(rootB)) {
      parent.set(rootB, rootA);
    } else {
      parent.set(rootB, rootA);
      rank.set(rootA, rank.get(rootA) + 1);
    }
  }

  for (const [from, to] of edges) {
    union(from, to);
  }

  const groups = new Map();
  for (const node of nodes) {
    const root = find(node);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(node);
  }

  const components = [];
  for (const members of groups.values()) {
    components.push(members.sort());
  }

  return components;
}

function detectCyclesPerComponent(adjacencyList, components) {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const colour = new Map();
  const componentCycles = new Map();
  let totalCycles = 0;

  components.forEach((comp, index) => {
    comp.forEach(node => colour.set(node, WHITE));
    let hasCycle = false;

    function dfs(u) {
      colour.set(u, GRAY);
      const neighbours = adjacencyList.get(u) || [];
      for (const v of neighbours) {
        if (colour.get(v) === GRAY) {
          hasCycle = true;
        } else if (colour.get(v) === WHITE) {
          dfs(v);
        }
      }
      colour.set(u, BLACK);
    }

    comp.forEach(node => {
      if (colour.get(node) === WHITE) {
        dfs(node);
      }
    });

    componentCycles.set(index, hasCycle);
    if (hasCycle) totalCycles++;
  });

  return { componentCycles, totalCycles };
}

function identifyRoots(adjacencyList, components) {
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
      componentRoots.set(index, roots.sort());
    } else {
      const sorted = [...component].sort();
      componentRoots.set(index, [sorted[0]]);
    }
  });

  return componentRoots;
}

function buildTree(root, adjacencyList) {
  const visited = new Set();
  let maxDepth = 0;

  function dfs(node, depth) {
    if (visited.has(node)) {
      return {}; 
    }

    visited.add(node);
    if (depth > maxDepth) maxDepth = depth;

    const neighbours = adjacencyList.get(node) || [];
    const treeNode = {};

    const sortedNeighbours = [...neighbours].sort();

    for (const child of sortedNeighbours) {
      treeNode[child] = dfs(child, depth + 1);
    }

    return treeNode;
  }

  const rootTree = {};
  rootTree[root] = dfs(root, 1);
  
  return { tree: rootTree, depth: maxDepth };
}

function buildHierarchies(componentRoots, adjacencyList, components, componentCycles) {
  const hierarchies = [];
  let totalTrees = 0;
  let largestTreeRoot = null;
  let maxDepthOverall = 0;

  for (const [compIndex, roots] of componentRoots) {
    if (componentCycles.get(compIndex)) {
      // Has cycle
      hierarchies.push({
        root: roots[0],
        tree: {},
        has_cycle: true
      });
      continue;
    }

    for (const root of roots) {
      const { tree, depth } = buildTree(root, adjacencyList);
      hierarchies.push({
        root,
        tree,
        depth
      });
      totalTrees++;

      if (depth > maxDepthOverall) {
        maxDepthOverall = depth;
        largestTreeRoot = root;
      } else if (depth === maxDepthOverall && largestTreeRoot !== null) {
        if (root < largestTreeRoot) {
          largestTreeRoot = root;
        }
      }
    }
  }

  return { hierarchies, totalTrees, largestTreeRoot };
}

function generateSummary(totalTrees, totalCycles, largestTreeRoot) {
  return {
    total_trees: totalTrees,
    total_cycles: totalCycles,
    largest_tree_root: largestTreeRoot
  };
}

module.exports = {
  buildAdjacencyList,
  findConnectedComponents,
  detectCyclesPerComponent,
  identifyRoots,
  buildHierarchies,
  generateSummary,
};
