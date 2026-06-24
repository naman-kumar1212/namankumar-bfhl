export default function CycleAlert({ totalCycles }) {
  if (totalCycles === 0) {
    return (
      <div className="panel p-4 border-l-4 border-l-[var(--success)] flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--success)] uppercase tracking-widest">
          System Check OK: Graph is a valid DAG
        </span>
        <span className="badge badge-success">No Cycles</span>
      </div>
    );
  }

  return (
    <div className="panel p-4 border-l-4 border-l-[var(--warning)] flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--warning)] uppercase tracking-widest">
          Warning: Cycle Detected
        </span>
        <span className="badge badge-warning">
          Count: {String(totalCycles).padStart(2, '0')}
        </span>
      </div>
      <p className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-widest mt-2">
        Cycle structures cannot form valid trees and are isolated.
      </p>
    </div>
  );
}
