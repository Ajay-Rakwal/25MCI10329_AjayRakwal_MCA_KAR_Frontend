require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { aStar, kruskalMST, dijkstraBudget, CAMPUS_GRAPH, NODE_POS } = require('./utils/graph');
const User = require('./models/User');
const Route = require('./models/Route');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/campus_navigator';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Graph Data Endpoint
app.get('/api/graph-data', (req, res) => {
    res.json({ graph: CAMPUS_GRAPH, positions: NODE_POS });
});

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        res.status(400).json({ error: 'Username already exists' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
        res.json({ userId: user._id, username: user.username });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Navigation Routes
app.get('/api/path', (req, res) => {
    const { start, goal } = req.query;
    if (!start || !goal) return res.status(400).json({ error: 'Start and goal required' });
    const result = aStar(start, goal);
    res.json(result);
});

app.get('/api/mst', (req, res) => {
    const result = kruskalMST();
    res.json(result);
});

app.get('/api/budget', (req, res) => {
    const { start, budget } = req.query;
    if (!start || !budget) return res.status(400).json({ error: 'Start and budget required' });
    const result = dijkstraBudget(start, parseFloat(budget));
    res.json(result);
});

// Saved Routes
app.post('/api/routes', async (req, res) => {
    const { userId, username, source, destination, path, cost } = req.body;
    try {
        const newRoute = new Route({ userId, username, source, destination, path, cost });
        await newRoute.save();
        res.status(201).json(newRoute);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/routes/:username', async (req, res) => {
    const routes = await Route.find({ username: req.params.username }).sort({ savedAt: -1 });
    res.json(routes);
});

app.delete('/api/routes/:id', async (req, res) => {
    try {
        await Route.findByIdAndDelete(req.params.id);
        res.json({ message: 'Route deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
