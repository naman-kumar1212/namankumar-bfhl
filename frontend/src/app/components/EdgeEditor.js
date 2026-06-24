"use client";

/**
 * EdgeEditor — form to add/remove graph edges with Interactive Form and Raw Text modes.
 */

import { useState } from "react";

const parseRawEdges = (text) => {
  const trimmed = text.trim();
  if (!trimmed) return [];

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
    } catch (e) {}
  }

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

const edgesToText = (edgeArray) => {
  return edgeArray
    .filter(([from, to]) => from || to)
    .map(([from, to]) => `${from} -> ${to}`)
    .join("\n");
};

export default function EdgeEditor({ edges, setEdges, onSubmit, loading }) {
  const [inputMode, setInputMode] = useState("form");
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
      ["A", "B"], ["A", "C"], ["B", "D"], ["C", "D"],
      ["D", "E"], ["F", "G"], ["G", "H"], ["H", "F"],
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
    <form onSubmit={handleSubmit} className="panel p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-widest">
            Edge Configuration
          </h2>
          <p className="text-[10px] text-[var(--foreground-muted)] uppercase mt-1">
            Specify network topology
          </p>
        </div>
        <button
          type="button"
          onClick={loadExample}
          className="btn-secondary"
        >
          Load Example
        </button>
      </div>

      {/* Input Mode Toggle */}
      <div className="flex bg-[var(--background)] border border-[var(--border)] p-1">
        <button
          type="button"
          onClick={() => handleModeChange("form")}
          className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
            inputMode === "form"
              ? "bg-[var(--foreground)] text-[var(--background)]"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Form Input
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("text")}
          className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
            inputMode === "text"
              ? "bg-[var(--foreground)] text-[var(--background)]"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Raw Text
        </button>
      </div>

      {/* Editor Content Area */}
      {inputMode === "form" ? (
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2">
          {edges.map((edge, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--foreground-dim)] w-6 text-right font-mono">
                {String(i + 1).padStart(2, '0')}
              </span>
              <input
                type="text"
                className="input-field flex-1"
                placeholder="Source"
                value={edge[0]}
                onChange={(e) => updateEdge(i, 0, e.target.value)}
                required
              />
              <span className="text-[var(--foreground-dim)] text-xs px-2">
                {"->"}
              </span>
              <input
                type="text"
                className="input-field flex-1"
                placeholder="Destination"
                value={edge[1]}
                onChange={(e) => updateEdge(i, 1, e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => removeEdge(i)}
                className="btn-danger w-8 h-8 flex items-center justify-center p-0"
                title="Remove edge"
                disabled={edges.length <= 1}
              >
                X
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            className="input-field w-full h-[320px] resize-none"
            placeholder={`A -> B\nA-B\nA B\n[["A","B"]]`}
            value={rawText}
            onChange={(e) => handleTextChange(e.target.value)}
            disabled={loading}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--border)]">
        {inputMode === "form" ? (
          <button
            type="button"
            onClick={addEdge}
            className="btn-secondary whitespace-nowrap"
            disabled={loading}
          >
            + Add Edge
          </button>
        ) : <div/>}
        
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-[10px] text-[var(--foreground-dim)] font-mono uppercase tracking-widest whitespace-nowrap">
            Parsed: {String(validEdgesCount).padStart(2, '0')}
          </span>
          <button type="submit" className="btn-primary whitespace-nowrap" disabled={loading}>
            {loading ? "Processing..." : "Process Graph"}
          </button>
        </div>
      </div>
    </form>
  );
}
