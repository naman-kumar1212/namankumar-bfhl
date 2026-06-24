"use client";

/**
 * CycleAlert — displays cycle detection results prominently.
 *
 * Shows a success banner when no cycles are found, or a
 * warning banner listing all cycle-forming edges.
 *
 * Props:
 *  @param {object} cycleInfo - { hasCycle: boolean, cycleEdges: string[][] }
 */

export default function CycleAlert({ cycleInfo }) {
  if (!cycleInfo.hasCycle) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--success-bg)] border border-[var(--success)]/20 animate-fade-in-up">
        <span className="text-2xl">✅</span>
        <div>
          <p className="text-sm font-semibold text-[var(--success)]">
            No Cycles Detected
          </p>
          <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
            The graph is a valid DAG (Directed Acyclic Graph)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-[var(--warning-bg)] border border-[var(--warning)]/20 animate-fade-in-up space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">⚠️</span>
        <div>
          <p className="text-sm font-semibold text-[var(--warning)]">
            Cycles Detected
          </p>
          <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
            {cycleInfo.cycleEdges.length} back-edge
            {cycleInfo.cycleEdges.length !== 1 ? "s" : ""} found forming
            cycle(s)
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 ml-9">
        {cycleInfo.cycleEdges.map(([from, to], i) => (
          <span key={i} className="badge badge-warning font-mono">
            {from} → {to}
          </span>
        ))}
      </div>
    </div>
  );
}
