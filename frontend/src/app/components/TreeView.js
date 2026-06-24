"use client";

/**
 * TreeView — recursive collapsible tree visualization.
 *
 * Renders the nested tree JSON from the API as an interactive
 * expandable/collapsible tree with visual indicators for:
 *  - Root nodes (crown icon)
 *  - Leaf nodes (dot)
 *  - Cycle back-references (warning icon)
 *  - Depth info
 *
 * Props:
 *  @param {object[]} trees - Array of { root, tree, depth, componentNodes }
 */

import { useState } from "react";

function TreeNode({ node, depth = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isCycleRef = node.cycleBackRef;

  return (
    <div className="tree-node">
      <div
        className="tree-label"
        onClick={() => hasChildren && setExpanded(!expanded)}
        style={{ cursor: hasChildren ? "pointer" : "default" }}
      >
        {/* Expand/collapse indicator */}
        {hasChildren && (
          <span
            className="text-[var(--foreground-dim)] text-xs transition-transform duration-200"
            style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
          >
            ▶
          </span>
        )}

        {/* Node name */}
        <span
          className={`font-medium ${
            isCycleRef
              ? "text-[var(--warning)] line-through opacity-70"
              : depth === 0
              ? "text-[var(--accent-light)]"
              : "text-[var(--foreground)]"
          }`}
        >
          {node.name}
        </span>

        {/* Indicators */}
        {depth === 0 && (
          <span className="badge badge-accent text-[10px]">root</span>
        )}
        {isCycleRef && (
          <span className="badge badge-warning text-[10px]">↩ cycle</span>
        )}
        {!hasChildren && !isCycleRef && (
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--foreground-dim)]" />
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="ml-2 mt-1 space-y-1 animate-fade-in">
          {node.children.map((child, i) => (
            <TreeNode key={`${child.name}-${i}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreeView({ trees }) {
  return (
    <div className="space-y-6">
      {trees.map((item, i) => (
        <div
          key={i}
          className="glass-card p-5 animate-fade-in-up"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {/* Tree header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                {i + 1}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)]">
                  Tree from <code className="text-[var(--accent-light)]">{item.root}</code>
                </h3>
                <p className="text-xs text-[var(--foreground-muted)]">
                  Component: [{item.componentNodes.join(", ")}]
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-accent">
                depth: {item.depth}
              </span>
            </div>
          </div>

          {/* Tree body */}
          <div className="pl-2 border-l border-[var(--border)]">
            <TreeNode node={item.tree} />
          </div>
        </div>
      ))}
    </div>
  );
}
