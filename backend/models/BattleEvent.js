const mongoose = require('mongoose');

const battleEventSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['scheduled', 'active', 'ended', 'revealed'],
        default: 'scheduled'
    },
    title: {
        type: String,
        default: 'School Wars'
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    winnerSchoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        default: null
    },
    winnerSchoolNameOverride: {
        type: String, // Manual Admin Override
        default: null
    },
    totalParticipants: {
        type: Number,
        default: 0
    },
    leaderboardSnapshot: [{
        schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
        schoolName: String,
        points: Number
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BattleEvent', battleEventSchema);
