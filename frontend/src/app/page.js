"use client";

/**
 * Main page — BFHL Graph Analyzer.
 *
 * Layout:
 *  - Minimalist Header
 *  - Left column: Edge Editor
 *  - Right column: Results (Stats → Cycle Alert → Trees → Summary)
 */

import { useState, useRef, useEffect } from "react";
import EdgeEditor from "./components/EdgeEditor";
import StatsPanel from "./components/StatsPanel";
import TreeView from "./components/TreeView";
import CycleAlert from "./components/CycleAlert";
import SummaryPanel from "./components/SummaryPanel";
import LoadingAnimation from "./components/LoadingAnimation";
import { animate, createTimeline, stagger } from "animejs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function Home() {
  const [edges, setEdges] = useState([["", ""]]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs for animation targets
  const headerRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const resultsContainerRef = useRef(null);

  // Initial Mount Animation
  useEffect(() => {
    const tl = createTimeline({
      easing: "spring(1, 80, 10, 0)",
    });

    tl.add([headerRef.current, leftPanelRef.current, rightPanelRef.current], {
      translateY: [30, 0],
      opacity: [0, 1],
      delay: stagger(150)
    });
  }, []);

  // Result Reveal Animation
  useEffect(() => {
    if (result && resultsContainerRef.current) {
      animate(resultsContainerRef.current.querySelectorAll('.result-panel'), {
        translateY: [20, 0],
        opacity: [0, 1],
        delay: stagger(100),
        easing: "spring(1, 80, 10, 0)",
      });
    }
  }, [result]);

  const handleSubmit = async () => {
    setError(null);
    setResult(null);

    const cleaned = edges
      .map(([from, to]) => {
        const f = from.trim();
        const t = to.trim();
        if (!f && !t) return null;
        if (!f) return `->${t}`;
        if (!t) return `${f}->`;
        return `${f}->${t}`;
      })
      .filter(Boolean);

    if (cleaned.length === 0) {
      setError("Please add at least one valid edge.");
      return;
    }

    setLoading(true);

    try {
      // Artificial delay to showcase the Anime.js processing block grid
      await new Promise(r => setTimeout(r, 1500));

      const baseUrl = API_URL.replace(/\/+$/, "");
      
      const res = await fetch(`${baseUrl}/bfhl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: cleaned }),
      });

      const json = await res.json();


      if (!res.ok) {
        throw new Error(
          json.error || json.details?.join(", ") || "Processing failed"
        );
      }

      setResult(json);
    } catch (err) {
      setError(err.message || "Failed to connect to the API server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col font-sans selection:bg-[var(--foreground)] selection:text-[var(--background)] overflow-x-hidden">
      {/* Header */}
      <header ref={headerRef} className="border-b border-[var(--border)] opacity-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-[var(--foreground)] tracking-widest uppercase">
              BFHL Graph Analyzer v1.0.0
            </h1>
            <p className="text-[10px] text-[var(--foreground-dim)] uppercase mt-1">
              Chitkara Full Stack Engineering Challenge
            </p>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            View Source
          </a>
        </div>
      </header>

      {/* ═══ Content ═══ */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Input */}
        <div ref={leftPanelRef} className="lg:col-span-4 opacity-0">
          <EdgeEditor 
              edges={edges}
              setEdges={setEdges}
              onSubmit={handleSubmit}
              loading={loading}
            />

            {/* Error alert */}
            {error && (
              <div className="panel flex flex-col p-4 border-[var(--danger)]/50">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-[var(--danger)] uppercase tracking-wider">
                    Error
                  </span>
                  <button
                    onClick={() => setError(null)}
                    className="text-[var(--foreground-dim)] hover:text-[var(--foreground)] text-xs uppercase"
                  >
                    Dismiss
                  </button>
                </div>
                <p className="text-xs text-[var(--foreground-muted)] font-mono">
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
        <div ref={rightPanelRef} className="lg:col-span-8 flex flex-col gap-6 opacity-0">
          <div className="min-h-[400px]">
            {!result && !loading && (
              <div className="panel p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <h3 className="text-xs font-bold text-[var(--foreground-dim)] uppercase tracking-widest mb-2">
                  Status: Idle
                </h3>
                <p className="text-xs text-[var(--foreground-muted)] max-w-xs font-sans">
                  System awaiting input. Add directed edges and initialize processing.
                </p>
              </div>
            )}

            {loading && (
              <div className="h-full min-h-[400px] flex items-center justify-center">
                <LoadingAnimation />
              </div>
            )}

            {/* Results State */}
            {result && !loading && (
              <div ref={resultsContainerRef} className="space-y-6">
                
                {/* Stats & Cycle Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="result-panel opacity-0">
                    <StatsPanel data={result} />
                  </div>
                  <div className="result-panel opacity-0">
                    <CycleAlert totalCycles={result.summary.total_cycles} />
                  </div>
                </div>

                {/* Trees */}
                <div className="result-panel opacity-0">
                  <h2 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest mb-3 flex items-center justify-between">
                    <span>Generated Hierarchies</span>
                    <span className="badge">
                      COUNT: {result.hierarchies.length}
                    </span>
                  </h2>
                  <TreeView hierarchies={result.hierarchies} />
                </div>

                {/* Summary Panel */}
                <div className="result-panel opacity-0">
                  <SummaryPanel 
                    summary={result.summary} 
                    invalidEntries={result.invalid_entries}
                    duplicateEdges={result.duplicate_edges}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-[var(--border)] py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-[10px] text-[var(--foreground-dim)] uppercase tracking-wider">
          <span>Chitkara FSEC — Graph Processing API</span>
          <span>Architecture: Express.js + Next.js</span>
        </div>
      </footer>
    </main>
  );
}
