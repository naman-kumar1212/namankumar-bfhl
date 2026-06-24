export default function StatsPanel({ data }) {
  const totalNodes = new Set();
  
  const extractNodes = (dict) => {
    for (const key in dict) {
      totalNodes.add(key);
      extractNodes(dict[key]);
    }
  };
  
  data.hierarchies.forEach(h => {
    if (h.tree) extractNodes(h.tree);
    if (h.root) totalNodes.add(h.root);
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="stat-card">
        <span className="stat-label">Total Nodes</span>
        <span className="stat-value">{String(totalNodes.size).padStart(2, '0')}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Valid Trees</span>
        <span className="stat-value">{String(data.summary.total_trees).padStart(2, '0')}</span>
      </div>
      <div className="stat-card border-l-2 border-l-[var(--danger)]">
        <span className="stat-label text-[var(--danger)]">Invalid Entries</span>
        <span className="stat-value text-[var(--danger)]">{String(data.invalid_entries.length).padStart(2, '0')}</span>
      </div>
      <div className="stat-card border-l-2 border-l-[var(--warning)]">
        <span className="stat-label text-[var(--warning)]">Duplicate Edges</span>
        <span className="stat-value text-[var(--warning)]">{String(data.duplicate_edges.length).padStart(2, '0')}</span>
      </div>
    </div>
  );
}
