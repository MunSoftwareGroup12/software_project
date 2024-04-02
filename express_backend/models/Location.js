const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    group: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    availability: {
        type: Boolean,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    x: {
        type: Number,
        required: true
    },
    y: {
        type: Number,
        required: true
    },
    z: {
        type: Number,
        required: true
    }
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;