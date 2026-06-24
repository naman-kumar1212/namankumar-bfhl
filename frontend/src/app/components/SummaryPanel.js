"use client";

/**
 * SummaryPanel — displays the raw text summary and adjacency list.
 *
 * Props:
 *  @param {string} summary - Human-readable summary from the API
 *  @param {object} adjacencyList - { node: [children...] }
 *  @param {string[][]} components - Connected component arrays
 */

import { useState } from "react";

export default function SummaryPanel({ summary, adjacencyList, components }) {
  const [showAdj, setShowAdj] = useState(false);

  return (
    <div className="space-y-4">
      {/* Summary text */}
      <div className="glass-card p-5 animate-fade-in-up">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
          <span className="text-base">📊</span> Analysis Summary
        </h3>
        <pre className="text-xs leading-relaxed text-[var(--foreground-muted)] font-mono whitespace-pre-wrap bg-[var(--surface-hover)] p-4 rounded-lg border border-[var(--border)]">
          {summary}
        </pre>
      </div>

      {/* Connected Components */}
      <div className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
          <span className="text-base">🔗</span> Connected Components
        </h3>
        <div className="flex flex-wrap gap-3">
          {components.map((comp, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)]"
            >
              <span className="w-5 h-5 rounded-md bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                {i + 1}
              </span>
              <div className="flex gap-1.5">
                {comp.map((node) => (
                  <span
                    key={node}
                    className="badge badge-accent font-mono text-xs"
                  >
                    {node}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Adjacency List (collapsible) */}
      <div className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <button
          onClick={() => setShowAdj(!showAdj)}
          className="w-full flex items-center justify-between text-sm font-semibold text-[var(--foreground)]"
        >
          <span className="flex items-center gap-2">
            <span className="text-base">🗺️</span> Adjacency List
          </span>
          <span
            className="text-xs text-[var(--foreground-dim)] transition-transform duration-200"
            style={{ transform: showAdj ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            ▼
          </span>
        </button>

        {showAdj && (
          <div className="mt-3 space-y-1.5 animate-fade-in">
            {Object.entries(adjacencyList).map(([node, children]) => (
              <div
                key={node}
                className="flex items-center gap-2 text-xs font-mono py-1.5 px-3 rounded-md hover:bg-[var(--surface-hover)] transition-colors"
              >
                <span className="text-[var(--accent-light)] font-semibold min-w-[24px]">
                  {node}
                </span>
                <span className="text-[var(--foreground-dim)]">→</span>
                {children.length > 0 ? (
                  <span className="text-[var(--foreground-muted)]">
                    [{children.join(", ")}]
                  </span>
                ) : (
                  <span className="text-[var(--foreground-dim)] italic">
                    (leaf)
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
