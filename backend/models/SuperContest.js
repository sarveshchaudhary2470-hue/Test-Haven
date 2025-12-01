const mongoose = require('mongoose');

const SuperContestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    classes: {
        type: [Number],
        required: [true, 'Please select at least one class'],
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'At least one class must be selected'
        }
    },
    subject: {
        type: String,
        required: [true, 'Please add a subject']
    },
    duration: {
        type: Number,
        required: [true, 'Please add duration'],
        min: [1, 'Duration must be at least 1 minute'],
        max: [180, 'Duration cannot exceed 180 minutes']
    },
    totalMarks: {
        type: Number,
        required: true
    },
    questions: [{
        question: {
            type: String,
            required: true
        },
        options: {
            type: [String],
            required: true,
            validate: {
                validator: function (v) {
                    return v.length === 4;
                },
                message: 'Each question must have exactly 4 options'
            }
        },
        correctAnswer: {
            type: Number,
            required: true,
            min: 0,
            max: 3
        },
        marks: {
            type: Number,
            required: true,
            default: 1
        }
    }],
    startTime: {
        type: Date,
        required: [true, 'Please add start time']
    },
    endTime: {
        type: Date,
        required: [true, 'Please add end time'],
        validate: {
            validator: function (v) {
                return v > this.startTime;
            },
            message: 'End time must be after start time'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    randomizeQuestions: {
        type: Boolean,
        default: false
    },
    randomizeOptions: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes for performance
SuperContestSchema.index({ school: 1, classes: 1, isActive: 1 });
SuperContestSchema.index({ startTime: 1, endTime: 1 });
SuperContestSchema.index({ createdBy: 1 });

// Cascade delete results when contest is deleted
SuperContestSchema.pre('deleteOne', { document: true, query: false }, async function () {
    await mongoose.model('SuperContestResult').deleteMany({ contest: this._id });
});

module.exports = mongoose.model('SuperContest', SuperContestSchema);
