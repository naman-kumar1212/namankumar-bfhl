export default function SummaryPanel({ summary, invalidEntries, duplicateEdges }) {
  return (
    <div className="panel p-6 border-t-2 border-t-[var(--foreground)] mt-8">
      <h2 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest mb-6">
        System Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="border-b border-[var(--border)] pb-2">
            <span className="text-[10px] uppercase text-[var(--foreground-muted)] tracking-widest block mb-1">
              Total Trees
            </span>
            <span className="text-sm font-mono text-[var(--foreground)]">
              {String(summary.total_trees).padStart(2, '0')}
            </span>
          </div>
          <div className="border-b border-[var(--border)] pb-2">
            <span className="text-[10px] uppercase text-[var(--foreground-muted)] tracking-widest block mb-1">
              Largest Tree Root
            </span>
            <span className="text-sm font-mono text-[var(--foreground)]">
              {summary.largest_tree_root || "None"}
            </span>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div>
            <h4 className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest mb-2 flex items-center justify-between border-b border-[var(--border)] pb-1">
              <span>Invalid Entries</span>
              <span className="text-[var(--danger)]">Error: {invalidEntries?.length || 0}</span>
            </h4>
            {invalidEntries?.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-3">
                {invalidEntries.map((entry, i) => (
                  <span key={i} className="px-2 py-1 bg-[var(--danger-bg)] text-[var(--danger)] text-[10px] border border-[var(--danger)] font-mono">
                    {entry}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-[var(--foreground-dim)] font-mono mt-3">No errors found</p>
            )}
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest mb-2 flex items-center justify-between border-b border-[var(--border)] pb-1">
              <span>Duplicate Edges</span>
              <span className="text-[var(--warning)]">Warning: {duplicateEdges?.length || 0}</span>
            </h4>
            {duplicateEdges?.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-3">
                {duplicateEdges.map((entry, i) => (
                  <span key={i} className="px-2 py-1 bg-[var(--warning-bg)] text-[var(--warning)] text-[10px] border border-[var(--warning)] font-mono">
                    {entry}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-[var(--foreground-dim)] font-mono mt-3">No warnings found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
