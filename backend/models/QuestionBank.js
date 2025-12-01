const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    questionTextHindi: {
        type: String
    },
    options: [{
        type: String,
        required: true
    }],
    optionsHindi: [{
        type: String
    }],
    correctAnswer: {
        type: Number,
        required: true,
        min: 0,
        max: 3
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    topic: {
        type: String,
        trim: true
    },
    marks: {
        type: Number,
        default: 1
    }
});

const questionBankSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    class: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    questions: [questionSchema],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    schools: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School'
    }],
    tags: [{
        type: String,
        trim: true
    }],
    isPublic: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Method to get random questions from bank
questionBankSchema.methods.getRandomQuestions = function (count, difficulty = null, topic = null) {
    let questions = this.questions;

    // Filter by difficulty
    if (difficulty) {
        questions = questions.filter(q => q.difficulty === difficulty);
    }

    // Filter by topic
    if (topic) {
        questions = questions.filter(q => q.topic === topic);
    }

    // Shuffle and select
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
};

// Method to get questions by difficulty distribution
questionBankSchema.methods.getQuestionsByDistribution = function (distribution) {
    // distribution = { easy: 5, medium: 10, hard: 5 }
    const result = [];

    for (const [difficulty, count] of Object.entries(distribution)) {
        const questions = this.questions.filter(q => q.difficulty === difficulty);
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        result.push(...shuffled.slice(0, Math.min(count, shuffled.length)));
    }

    return result;
};

module.exports = mongoose.model('QuestionBank', questionBankSchema);
