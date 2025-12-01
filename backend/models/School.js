const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    contactEmail: {
        type: String,
        trim: true
    },
    contactPhone: {
        type: String,
        trim: true
    },
    maxClass: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('School', schoolSchema);
