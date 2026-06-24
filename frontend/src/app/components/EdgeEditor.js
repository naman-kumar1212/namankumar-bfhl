"use client";

/**
 * EdgeEditor — form to add/remove graph edges with Interactive Form and Raw Text modes.
 *
 * Props:
 *  @param {string[][]} edges - Current edges array
 *  @param {function} setEdges - State setter
 *  @param {function} onSubmit - Called when user clicks Process
 *  @param {boolean} loading - Disables form during API call
 */

import { useState } from "react";

// Robust parser helper
const parseRawEdges = (text) => {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Try parsing JSON format
  if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
    try {
      const parsedJson = JSON.parse(trimmed);
      let edgeList = [];
      if (Array.isArray(parsedJson)) {
        edgeList = parsedJson;
      } else if (parsedJson && Array.isArray(parsedJson.edges)) {
        edgeList = parsedJson.edges;
      }
      
      const validEdges = edgeList.filter(
        (edge) => Array.isArray(edge) && edge.length === 2 && typeof edge[0] === "string" && typeof edge[1] === "string"
      );
      if (validEdges.length > 0) {
        return validEdges.map(([from, to]) => [from.trim(), to.trim()]);
      }
    } catch (e) {
      // Fallback if JSON parsing fails
    }
  }

  // Fallback parser: split by newlines or commas
  const lines = text.split(/[\n,]+/);
  const parsed = [];
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    let parts = [];
    if (line.includes("->")) {
      parts = line.split("->");
    } else if (line.includes("=>")) {
      parts = line.split("=>");
    } else if (line.includes("-")) {
      parts = line.split("-");
    } else {
      parts = line.split(/\s+/);
    }

    if (parts.length >= 2) {
      const from = parts[0].trim();
      const to = parts[1].trim();
      if (from && to) {
        parsed.push([from, to]);
      }
    }
  }
  return parsed;
};

// Convert edges array back to raw text representation
const edgesToText = (edgeArray) => {
  return edgeArray
    .filter(([from, to]) => from || to)
    .map(([from, to]) => `${from} -> ${to}`)
    .join("\n");
};

export default function EdgeEditor({ edges, setEdges, onSubmit, loading }) {
  const [inputMode, setInputMode] = useState("form"); // "form" | "text"
  const [rawText, setRawText] = useState("");

  const addEdge = () => setEdges([...edges, ["", ""]]);

  const removeEdge = (index) => {
    if (edges.length <= 1) return;
    setEdges(edges.filter((_, i) => i !== index));
  };

  const updateEdge = (index, field, value) => {
    const updated = edges.map((edge, i) => {
      if (i !== index) return edge;
      const copy = [...edge];
      copy[field] = value;
      return copy;
    });
    setEdges(updated);
  };

  const handleModeChange = (mode) => {
    setInputMode(mode);
    if (mode === "text") {
      setRawText(edgesToText(edges));
    }
  };

  const handleTextChange = (text) => {
    setRawText(text);
    const parsed = parseRawEdges(text);
    if (parsed.length > 0) {
      setEdges(parsed);
    } else {
      setEdges([["", ""]]);
    }
  };

  const loadExample = () => {
    const exampleEdges = [
      ["A", "B"],
      ["A", "C"],
      ["B", "D"],
      ["C", "D"],
      ["D", "E"],
      ["F", "G"],
      ["G", "H"],
      ["H", "F"],
    ];
    setEdges(exampleEdges);
    setRawText(edgesToText(exampleEdges));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const validEdgesCount = edges.filter(([f, t]) => f.trim() && t.trim()).length;

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Edge Editor
          </h2>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Specify the directed node list and relationships
          </p>
        </div>
        <button
          type="button"
          onClick={loadExample}
          className="btn-secondary text-xs"
        >
          ✨ Load Example
        </button>
      </div>

      {/* Input Mode Toggle */}
      <div className="flex bg-[var(--surface)] p-1 rounded-lg border border-[var(--border)] text-xs">
        <button
          type="button"
          onClick={() => handleModeChange("form")}
          className={`flex-1 py-1.5 rounded-md font-medium transition-all ${
            inputMode === "form"
              ? "bg-[var(--accent)] text-white shadow-sm"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          📝 Interactive Form
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("text")}
          className={`flex-1 py-1.5 rounded-md font-medium transition-all ${
            inputMode === "text"
              ? "bg-[var(--accent)] text-white shadow-sm"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          💻 Raw Text Area
        </button>
      </div>

      {/* Editor Content Area */}
      {inputMode === "form" ? (
        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
          {edges.map((edge, i) => (
            <div
              key={i}
              className="flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: `${i * 10}ms` }}
            >
              <span className="text-xs text-[var(--foreground-dim)] w-6 text-right font-mono">
                {i + 1}
              </span>
              <input
                type="text"
                className="input-field flex-1"
                placeholder="From node"
                value={edge[0]}
                onChange={(e) => updateEdge(i, 0, e.target.value)}
                required
              />
              <span className="text-[var(--accent-light)] text-lg select-none">
                →
              </span>
              <input
                type="text"
                className="input-field flex-1"
                placeholder="To node"
                value={edge[1]}
                onChange={(e) => updateEdge(i, 1, e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => removeEdge(i)}
                className="btn-danger px-2.5 py-1.5 text-xs"
                title="Remove edge"
                disabled={edges.length <= 1}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            className="input-field w-full h-[320px] font-mono text-xs p-3 resize-none bg-[var(--surface-dark)]/50 border-[var(--border)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
            placeholder={`Enter edges here. Supported formats:\n1. Arrow: A -> B\n2. Hyphen: A-B\n3. Space: A B\n4. JSON: [["A","B"], ["B","C"]]\n\nOne edge per line or comma-separated.`}
            value={rawText}
            onChange={(e) => handleTextChange(e.target.value)}
            disabled={loading}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-[var(--border)]">
        {inputMode === "form" && (
          <button
            type="button"
            onClick={addEdge}
            className="btn-secondary flex items-center gap-1.5"
            disabled={loading}
          >
            <span className="text-[var(--accent-light)]">+</span> Add Edge
          </button>
        )}
        <div className="flex-1" />
        <span className="text-xs text-[var(--foreground-dim)] font-mono">
          {validEdgesCount} parsed edge{validEdgesCount !== 1 ? "s" : ""}
        </span>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
              Processing…
            </span>
          ) : (
            "🚀 Process Graph"
          )}
        </button>
      </div>
    </form>
  );
}
