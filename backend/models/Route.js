const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    source: String,
    destination: String,
    path: [String],
    cost: Number,
    savedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Route', RouteSchema);
