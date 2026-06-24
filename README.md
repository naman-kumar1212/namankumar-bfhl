# Chitkara Full Stack Engineering Challenge — Graph Analyzer & API

A high-performance, premium single-page web application and REST API for parsing, analyzing, and visualizing directed graphs. Built as a response to the Chitkara Full Stack Engineering Challenge.

---

## 🚀 Live Demos
- **Backend API**: Hosted on **Render** (e.g., `https://bfhl-graph-api.onrender.com`)
- **Frontend App**: Hosted on **Vercel** (e.g., `https://bfhl-graph-analyzer.vercel.app`)

---

## 🏛️ Architecture & Folder Structure

The project maintains a strict clean architecture separated into distinct layers:

```
bfhl-api/
├── server.js                   # Main entry point (loads env & starts HTTP server)
├── render.yaml                 # Infrastructure configuration for Render
├── package.json                # Project dependencies and run scripts
├── src/
│   ├── app.js                  # Express app factory (helmet, CORS, routes setup)
│   ├── config/                 # Environment variables config mapping
│   ├── middleware/             # Express middleware (centralized error handler)
│   ├── controllers/            # Controller layer (handles req/res flow control)
│   ├── routes/                 # Routing layer (exposes HTTP endpoints)
│   ├── services/               # Orchestrates graph algorithm steps
│   └── utils/
│       ├── graphUtils.js       # Pure graph processing & algorithm functions
│       └── validators.js       # express-validator schemas & self-loop checkers
├── tests/
│   ├── api.test.js             # Integration tests for /bfhl endpoints (34/34 passing)
│   └── graphUtils.test.js      # Unit tests for graph algorithms
└── frontend/                   # Next.js + Tailwind React SPA
    ├── src/
    │   ├── app/
    │   │   ├── page.js         # Single-page interface & API client state
    │   │   ├── globals.css     # Premium dark theme and animations stylesheet
    │   │   └── components/     # Modulized UI parts (TreeView, EdgeEditor, etc.)
    └── package.json
```

---

## ⚡ API Endpoint Reference

### 1. Process Graph Configuration
Exposes graph processing capabilities. Automatically removes duplicate edges, detects cycles, identifies connected components, extracts root nodes, builds node tree views, calculates tree depths, and outputs a formatted summary.

- **Route:** `/bfhl`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Body Example:**
```json
{
  "edges": [
    ["A", "B"],
    ["B", "C"],
    ["C", "D"],
    ["D", "C"]
  ]
}
```

- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "adjacencyList": {
      "A": ["B"],
      "B": ["C"],
      "C": ["D"],
      "D": ["C"]
    },
    "totalNodes": 4,
    "totalEdges": 4,
    "duplicatesRemoved": 0,
    "cycleInfo": {
      "hasCycle": true,
      "cycleEdges": [["C", "D"], ["D", "C"]]
    },
    "components": [["A", "B", "C", "D"]],
    "trees": [
      {
        "root": "A",
        "depth": 3,
        "structure": {
          "node": "A",
          "children": [
            {
              "node": "B",
              "children": [
                {
                  "node": "C",
                  "children": [
                    {
                      "node": "D",
                      "children": [],
                      "cycleBackRef": "C"
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    ],
    "summary": "Graph has 4 nodes and 4 edges. 1 connected component(s). Cycles detected! Cycle edges: C->D, D->C."
  }
}
```

- **Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Self-loops are not allowed"
}
```

### 2. Operation Info
Returns the system operational status code.
- **Route:** `/bfhl`
- **Method:** `GET`
- **Response:**
```json
{
  "success": true,
  "operation_code": 1
}
```

---

## 💻 Frontend Features
1. **Dual Input Methods:**
   - **Interactive Form:** Add, modify, or remove edges (`from -> to` string fields) on the fly with animated inputs.
   - **Raw Text Area:** Type or paste relationships directly. Supports arrow-separation (`A -> B`), hyphen-separation (`A-B`), space-separation (`A B`), or direct JSON array format. Real-time parsed output indicator keeps you updated.
2. **Analysis Summary Dashboard:** Shows metric cards highlighting Node Count, Edge Count, Disconnected Component Count, and Duplicate Edges filtered.
3. **Interactive Tree Visualizer:** Collapsible tree views representing the resolved hierarchies, featuring indicators for Roots, Leaf nodes, and Cycle-Back-Ref boundaries.
4. **Diagnostic Warnings:** Active cycle warning banner listing the feedback-loop edge relationships.

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Clone & Set Up Backend
1. Go to the project root directory.
2. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the backend developer server:
   ```bash
   npm run dev
   ```
   The backend server will run on `http://localhost:3000`.

### 2. Set Up Frontend
1. Change directory to `/frontend`.
2. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the frontend developer server:
   ```bash
   npm run dev
   ```
   The application will boot on `http://localhost:3001` (or next available port).

---

## 🧪 Testing

The backend includes a comprehensive test suite covering all algorithm edge cases and API routes.

```bash
# Run unit & integration tests (34 test cases)
npm test
```

### Key Test Categories
- **Duplicates Removal:** Deduplicates redundant edges.
- **Diamond/Multi-Parent DAGs:** Correct parent-child allocations without infinite recursion.
- **Pure Cycles Root Selection:** Picks the lexicographically smallest node when no standard root is found.
- **Disconnected Components:** Parses separate graphs concurrently.
- **Validation constraints:** Rejects self-loops, missing arguments, or type mismatch.

---

## 🚀 Deployment Guide

### Deploy Backend to Render
1. Connect your repository to Render.
2. Deploy a new **Web Service**.
3. Render will auto-detect the `render.yaml` configuration at the root and spin up the Express.js service.

### Deploy Frontend to Vercel
1. Import the repository in Vercel.
2. Select the `frontend` folder as the Root Directory.
3. Add the environment variable:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `<YOUR_RENDER_BACKEND_URL>`
4. Deploy the project.
