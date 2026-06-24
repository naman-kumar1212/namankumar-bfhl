import React from "react";

function renderDictionaryTree(dict) {
  if (!dict || Object.keys(dict).length === 0) return null;
  
  return (
    <ul className="pl-4 border-l border-[var(--border)] ml-[11px] mt-2 space-y-2 font-mono">
      {Object.keys(dict).map(node => (
        <li key={node} className="relative">
          <div className="flex items-center gap-2 before:content-[''] before:absolute before:-left-4 before:top-3 before:w-4 before:h-px before:bg-[var(--border)]">
            <span className="px-2 py-0.5 bg-[var(--surface-hover)] border border-[var(--border)] text-[10px] text-[var(--foreground)] uppercase">
              {node}
            </span>
          </div>
          {renderDictionaryTree(dict[node])}
        </li>
      ))}
    </ul>
  );
}

export default function TreeView({ hierarchies }) {
  if (!hierarchies || hierarchies.length === 0) {
    return (
      <div className="panel p-8 text-center text-xs text-[var(--foreground-muted)] uppercase tracking-widest">
        No hierarchies generated
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {hierarchies.map((h, i) => (
        <div
          key={i}
          className={`panel p-5 ${
            h.has_cycle ? "border-l-2 border-l-[var(--warning)]" : "border-l-2 border-l-[var(--foreground)]"
          }`}
        >
          <div className="flex items-center justify-between mb-4 border-b border-[var(--border)] pb-3">
            <h3 className="font-bold text-[10px] text-[var(--foreground)] uppercase tracking-widest">
              Root: {h.root}
            </h3>
            {h.has_cycle ? (
              <span className="badge badge-warning">Cycle Warning</span>
            ) : (
              <span className="badge">Depth: {h.depth}</span>
            )}
          </div>
          
          <div className="overflow-x-auto pb-2">
            <div className="min-w-fit">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[var(--foreground)] text-[var(--background)] text-xs font-bold uppercase tracking-widest font-mono">
                  {h.root}
                </span>
              </div>
              {h.tree && h.tree[h.root] ? renderDictionaryTree(h.tree[h.root]) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
