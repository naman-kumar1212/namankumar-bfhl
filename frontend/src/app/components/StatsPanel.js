"use client";

/**
 * StatsPanel — displays key metrics as animated stat cards.
 *
 * Props:
 *  @param {object} data - API response data
 */

export default function StatsPanel({ data }) {
  const stats = [
    {
      label: "Total Nodes",
      value: data.totalNodes,
      icon: "⬡",
    },
    {
      label: "Unique Edges",
      value: data.totalEdges,
      icon: "→",
    },
    {
      label: "Components",
      value: data.components.length,
      icon: "◎",
    },
    {
      label: "Duplicates Removed",
      value: data.duplicatesRemoved,
      icon: "✂",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="stat-card animate-fade-in-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{stat.icon}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
          <span className="stat-value">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
