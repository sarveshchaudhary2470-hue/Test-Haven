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
    }
});

const testSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    class: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    duration: {
        type: Number,
        required: true,
        min: [1, 'Duration must be at least 1 minute'],
        default: 60 // in minutes
    },
    totalMarks: {
        type: Number,
        required: true,
        default: 100
    },
    questions: [questionSchema],
    schools: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    scheduledDate: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Phase 3: Advanced Test Features
    randomizeQuestions: {
        type: Boolean,
        default: false
    },
    randomizeOptions: {
        type: Boolean,
        default: false
    },
    scheduledPublishAt: {
        type: Date
    },
    scheduledCloseAt: {
        type: Date
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    isClosed: {
        type: Boolean,
        default: false
    },
    questionBankId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuestionBank'
    },
    // Phase 4: Analytics & Reporting
    trackTimePerQuestion: {
        type: Boolean,
        default: false
    },
    allowReview: {
        type: Boolean,
        default: true
    },
    showCorrectAnswers: {
        type: Boolean,
        default: false
    },
    passingPercentage: {
        type: Number,
        default: 40,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
});

// Method to randomize questions for a student
testSchema.methods.getRandomizedQuestions = function () {
    if (!this.randomizeQuestions) return this.questions;

    const shuffled = [...this.questions].sort(() => Math.random() - 0.5);
    return shuffled;
};

// Method to randomize options for a question
testSchema.methods.getRandomizedOptions = function (question) {
    if (!this.randomizeOptions) return question;

    const indices = [0, 1, 2, 3];
    const shuffledIndices = indices.sort(() => Math.random() - 0.5);

    return {
        ...question.toObject(),
        options: shuffledIndices.map(i => question.options[i]),
        optionsHindi: question.optionsHindi ? shuffledIndices.map(i => question.optionsHindi[i]) : [],
        correctAnswer: shuffledIndices.indexOf(question.correctAnswer)
    };
};

// Check if test should be published
testSchema.methods.shouldBePublished = function () {
    if (!this.scheduledPublishAt) return this.isPublished;
    return Date.now() >= this.scheduledPublishAt && !this.isClosed;
};

// Check if test should be closed
testSchema.methods.shouldBeClosed = function () {
    if (this.isClosed) return true;
    if (!this.scheduledCloseAt) return false;
    return Date.now() >= this.scheduledCloseAt;
};

// Index for faster queries
testSchema.index({ class: 1, subject: 1 });
testSchema.index({ schools: 1, isActive: 1 });
testSchema.index({ scheduledPublishAt: 1, isPublished: 1 });

// Cascade delete results when a test is deleted
testSchema.pre('deleteOne', { document: true, query: false }, async function () {
    console.log(`Cascade deleting results for test ${this._id}`);
    await mongoose.model('Result').deleteMany({ test: this._id });
});

module.exports = mongoose.model('Test', testSchema);
