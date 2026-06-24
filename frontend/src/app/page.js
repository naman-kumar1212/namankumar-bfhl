"use client";

/**
 * Main page — BFHL Graph Analyzer.
 *
 * Layout:
 *  - Header with gradient title
 *  - Left column: Edge Editor
 *  - Right column: Results (Stats → Cycle Alert → Trees → Summary)
 *  - Error handling with toast-like alerts
 */

import { useState } from "react";
import EdgeEditor from "./components/EdgeEditor";
import StatsPanel from "./components/StatsPanel";
import TreeView from "./components/TreeView";
import CycleAlert from "./components/CycleAlert";
import SummaryPanel from "./components/SummaryPanel";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function Home() {
  const [edges, setEdges] = useState([["", ""]]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setError(null);
    setResult(null);

    // Client-side quick validation
    const cleaned = edges
      .map(([from, to]) => [from.trim(), to.trim()])
      .filter(([from, to]) => from && to);

    if (cleaned.length === 0) {
      setError("Please add at least one valid edge with both nodes filled in.");
      return;
    }

    // Check for self-loops client-side
    const selfLoop = cleaned.find(([from, to]) => from === to);
    if (selfLoop) {
      setError(`Self-loop detected: "${selfLoop[0]}" → "${selfLoop[1]}". Self-loops are not allowed.`);
      return;
    }

    setLoading(true);

    try {
      // Safely strip any trailing slash the user might have accidentally added to NEXT_PUBLIC_API_URL
      const baseUrl = API_URL.replace(/\/+$/, "");
      
      const res = await fetch(`${baseUrl}/bfhl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edges: cleaned }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error || json.details?.join(", ") || "Processing failed"
        );
      }

      setResult(json.data);
    } catch (err) {
      setError(err.message || "Failed to connect to the API server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col">
      {/* ═══ Header ═══ */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-[var(--accent)]/20">
              G
            </div>
            <div>
              <h1 className="text-base font-bold bg-gradient-to-r from-[var(--accent-light)] to-[var(--cyan)] bg-clip-text text-transparent">
                BFHL Graph Analyzer
              </h1>
              <p className="text-[11px] text-[var(--foreground-dim)]">
                Chitkara Full Stack Engineering Challenge
              </p>
            </div>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>
        </div>
      </header>

      {/* ═══ Content ═══ */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Editor */}
          <div className="lg:col-span-5 space-y-4">
            <EdgeEditor
              edges={edges}
              setEdges={setEdges}
              onSubmit={handleSubmit}
              loading={loading}
            />

            {/* Error alert */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--danger-bg)] border border-[var(--danger)]/20 animate-fade-in-up">
                <span className="text-lg mt-0.5">❌</span>
                <div>
                  <p className="text-sm font-semibold text-[var(--danger)]">
                    Error
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">
                    {error}
                  </p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-[var(--foreground-dim)] hover:text-[var(--foreground)] text-sm"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-7 space-y-6">
            {!result && !loading && (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)]/20 to-purple-500/20 flex items-center justify-center text-3xl mb-4">
                  🔬
                </div>
                <h3 className="text-base font-semibold text-[var(--foreground)] mb-2">
                  Ready to Analyze
                </h3>
                <p className="text-sm text-[var(--foreground-muted)] max-w-xs">
                  Add your directed edges on the left and click{" "}
                  <strong className="text-[var(--accent-light)]">
                    Process Graph
                  </strong>{" "}
                  to see the analysis results.
                </p>
                <p className="text-xs text-[var(--foreground-dim)] mt-3">
                  Or click <strong>✨ Load Example</strong> to try a sample graph
                </p>
              </div>
            )}

            {loading && (
              <div className="space-y-4 animate-fade-in">
                <div className="skeleton h-24 w-full" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="skeleton h-20 w-full" />
                  ))}
                </div>
                <div className="skeleton h-48 w-full" />
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-fade-in">
                {/* Stats */}
                <StatsPanel data={result} />

                {/* Cycle Detection */}
                <CycleAlert cycleInfo={result.cycleInfo} />

                {/* Trees */}
                <div>
                  <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
                    <span>🌳</span> Generated Trees
                    <span className="badge badge-accent text-[10px]">
                      {result.trees.length} tree
                      {result.trees.length !== 1 ? "s" : ""}
                    </span>
                  </h2>
                  <TreeView trees={result.trees} />
                </div>

                {/* Summary + Adjacency + Components */}
                <SummaryPanel
                  summary={result.summary}
                  adjacencyList={result.adjacencyList}
                  components={result.components}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-[var(--border)] py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-[var(--foreground-dim)]">
          <span>Chitkara FSEC — Graph Processing API</span>
          <span>Built with Express.js + Next.js</span>
        </div>
      </footer>
    </main>
  );
}
