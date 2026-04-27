const CAMPUS_GRAPH = {
    'Front Gate': { 'Library': 2, 'Canteen': 4, 'Admin': 3 },
    'Admin': { 'Front Gate': 3, 'Library': 2, 'Auditorium': 4, 'Research Block': 5 },
    'Library': { 'Front Gate': 2, 'Admin': 2, 'Hostel': 3, 'Lab': 4, 'Research Block': 3 },
    'Hostel': { 'Library': 3, 'Lab': 2, 'Sports Complex': 5, 'Parking': 6 },
    'Canteen': { 'Front Gate': 4, 'Lab': 3, 'Cultural Center': 4 },
    'Lab': { 'Library': 4, 'Hostel': 2, 'Canteen': 3, 'Ground': 5, 'Auditorium': 6, 'Research Block': 4 },
    'Ground': { 'Lab': 5, 'Sports Complex': 3, 'Parking': 4, 'Back Gate': 4 },
    'Sports Complex': { 'Hostel': 5, 'Ground': 3, 'Parking': 2, 'Back Gate': 5 },
    'Auditorium': { 'Admin': 4, 'Lab': 6, 'Cultural Center': 2 },
    'Cultural Center': { 'Canteen': 4, 'Auditorium': 2, 'Parking': 5 },
    'Parking': { 'Ground': 4, 'Sports Complex': 2, 'Cultural Center': 5, 'Hostel': 6, 'Back Gate': 3 },
    'Research Block': { 'Library': 3, 'Lab': 4, 'Admin': 5 },
    'Back Gate': { 'Parking': 3, 'Ground': 4, 'Sports Complex': 5 }
};

const NODE_POS = {
    'Front Gate': [60, 180],
    'Admin': [170, 130],
    'Library': [250, 60],
    'Hostel': [420, 40],
    'Research Block': [330, 100],
    'Lab': [420, 180],
    'Canteen': [250, 300],
    'Ground': [550, 230],
    'Sports Complex': [620, 90],
    'Auditorium': [500, 130],
    'Cultural Center': [400, 330],
    'Parking': [620, 280],
    'Back Gate': [740, 200]
};

// Simple Priority Queue for algorithms
class PriorityQueue {
    constructor() {
        this.values = [];
    }
    enqueue(val, priority) {
        this.values.push({ val, priority });
        this.sort();
    }
    dequeue() {
        return this.values.shift();
    }
    sort() {
        this.values.sort((a, b) => a.priority - b.priority);
    }
    isEmpty() {
        return this.values.length === 0;
    }
}

function aStar(start, goal) {
    let pq = new PriorityQueue();
    pq.enqueue(start, 0);
    let cameFrom = {};
    let costSoFar = {};
    cameFrom[start] = null;
    costSoFar[start] = 0;

    while (!pq.isEmpty()) {
        let current = pq.dequeue().val;

        if (current === goal) break;

        for (let next in CAMPUS_GRAPH[current]) {
            let newCost = costSoFar[current] + CAMPUS_GRAPH[current][next];
            if (!(next in costSoFar) || newCost < costSoFar[next]) {
                costSoFar[next] = newCost;
                let priority = newCost; // Heuristic can be added here
                pq.enqueue(next, priority);
                cameFrom[next] = current;
            }
        }
    }

    if (!(goal in cameFrom)) return { path: null, cost: Infinity };

    let path = [];
    let current = goal;
    while (current !== null) {
        path.push(current);
        current = cameFrom[current];
    }
    path.reverse();
    return { path, cost: costSoFar[goal] };
}

function kruskalMST() {
    let edges = [];
    let seen = new Set();
    for (let u in CAMPUS_GRAPH) {
        for (let v in CAMPUS_GRAPH[u]) {
            let key = [u, v].sort().join('-');
            if (!seen.has(key)) {
                seen.add(key);
                edges.push({ u, v, w: CAMPUS_GRAPH[u][v] });
            }
        }
    }
    edges.sort((a, b) => a.w - b.w);

    let parent = {};
    for (let node in CAMPUS_GRAPH) parent[node] = node;

    function find(i) {
        if (parent[i] === i) return i;
        return find(parent[i]);
    }

    function union(i, j) {
        let rootI = find(i);
        let rootJ = find(j);
        if (rootI !== rootJ) {
            parent[rootI] = rootJ;
            return true;
        }
        return false;
    }

    let mst = [];
    let totalWeight = 0;
    for (let edge of edges) {
        if (union(edge.u, edge.v)) {
            mst.push(edge);
            totalWeight += edge.w;
        }
    }
    return { mst, totalWeight };
}

function dijkstraBudget(start, budget) {
    let dist = {};
    let parent = {};
    for (let node in CAMPUS_GRAPH) {
        dist[node] = Infinity;
        parent[node] = null;
    }
    dist[start] = 0;

    let pq = new PriorityQueue();
    pq.enqueue(start, 0);

    while (!pq.isEmpty()) {
        let d = pq.dequeue();
        let u = d.val;
        let d_val = d.priority;

        if (d_val > dist[u]) continue;

        for (let v in CAMPUS_GRAPH[u]) {
            let weight = CAMPUS_GRAPH[u][v];
            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                parent[v] = u;
                pq.enqueue(v, dist[v]);
            }
        }
    }

    let reachable = [];
    let sptEdges = [];
    for (let node in dist) {
        if (dist[node] <= budget) {
            reachable.push({ node, dist: dist[node] });
            if (parent[node]) {
                sptEdges.push({ u: parent[node], v: node });
            }
        }
    }
    return { reachable, sptEdges };
}

module.exports = { aStar, kruskalMST, dijkstraBudget, CAMPUS_GRAPH, NODE_POS };
