const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    selectedAnswer: {
        type: Number,
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    },
    // Phase 4: Time tracking per question
    timeSpent: {
        type: Number, // in seconds
        default: 0
    }
});

const resultSchema = new mongoose.Schema({
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
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
    answers: [answerSchema],
    score: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    correctAnswers: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    timeTaken: {
        type: Number, // in seconds
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    // Phase 4: Analytics fields
    isPassed: {
        type: Boolean
    },
    rank: {
        type: Number
    },
    attemptNumber: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

// Index for faster queries
resultSchema.index({ test: 1, student: 1 }, { unique: true });
resultSchema.index({ school: 1, test: 1 });

module.exports = mongoose.model('Result', resultSchema);
