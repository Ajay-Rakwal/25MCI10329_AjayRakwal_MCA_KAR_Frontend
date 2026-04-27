# Campus Navigator Web (MERN)

A minimalistic and light web-based campus navigation system.

## Features
- **Shortest Path (A*)**: Find the quickest way between locations.
- **Minimum Spanning Tree (Kruskal)**: Visualize the most efficient way to connect all locations.
- **Reachability (Dijkstra)**: See which locations are within a specific distance budget.
- **Interactive Map**: SVG-based map with real-time highlighting.
- **History**: Save and view your favorite routes.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS (for layout utilities), Lucide React (icons), Framer Motion (animations).
- **Backend**: Node.js, Express.
- **Database**: MongoDB.

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed and running locally

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
The server will run on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The app will be available at `http://localhost:5173`.

## Design Choices
- **Typography**: Inter (Modern, highly legible).
- **Colors**: Slate and Blue palette for a clean, professional "light mode" aesthetic.
- **UI**: Minimalist cards, subtle shadows, and interactive SVG map.
