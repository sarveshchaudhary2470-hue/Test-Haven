const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['test', 'result', 'material', 'reminder', 'announcement', 'general'],
        default: 'general'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    targetAudience: {
        role: {
            type: String,
            enum: ['all', 'student', 'principal'],
            default: 'all'
        },
        schools: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'School'
        }],
        classes: [Number]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date
    },
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for efficient querying - removed compound index on parallel arrays
// MongoDB doesn't support indexing multiple array fields together
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
