const mongoose = require('mongoose');

const SuperContestResultSchema = new mongoose.Schema({
    contest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SuperContest',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    answers: {
        type: [Number],
        required: true
    },
    score: {
        type: Number,
        required: true,
        default: 0
    },
    percentage: {
        type: Number,
        required: true,
        default: 0
    },
    timeTaken: {
        type: Number, // milliseconds from start
        required: false // Not required initially
    },
    startedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    submittedAt: {
        type: Date,
        required: false // Not required initially
    },
    status: {
        type: String,
        enum: ['in-progress', 'submitted'],
        default: 'in-progress'
    },
    rank: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound index for leaderboard queries
SuperContestResultSchema.index({ contest: 1, score: -1, timeTaken: 1 });
SuperContestResultSchema.index({ contest: 1, student: 1 }, { unique: true });
SuperContestResultSchema.index({ school: 1, contest: 1 });

// Calculate rank before saving
SuperContestResultSchema.pre('save', async function () {
    // Only calculate rank if status is submitted and (isNew or status changed or score changed)
    if (this.status === 'submitted' && (this.isNew || this.isModified('status') || this.isModified('score'))) {
        // Get all results for this contest sorted by score (desc) and time (asc)
        const results = await this.constructor.find({ contest: this.contest, status: 'submitted' })
            .sort({ score: -1, timeTaken: 1, submittedAt: 1 });

        // Find position of current result
        let rank = 1;
        for (let i = 0; i < results.length; i++) {
            if (results[i].score > this.score ||
                (results[i].score === this.score && results[i].timeTaken < this.timeTaken) ||
                (results[i].score === this.score && results[i].timeTaken === this.timeTaken &&
                    results[i].submittedAt < this.submittedAt)) {
                rank++;
            }
        }
        this.rank = rank;

        // Update ranks of other results if needed
        // Note: This might be expensive. For now, we just calculate the current user's rank.
        // To keep it simple and avoid deadlocks, we won't trigger a cascading update here.
        // A periodic job or a separate "recalculate leaderboard" endpoint is better for that.
    }
});

module.exports = mongoose.model('SuperContestResult', SuperContestResultSchema);
