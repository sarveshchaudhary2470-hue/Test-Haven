const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'principal', 'teacher', 'manager', 'student'],
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: function () {
            // School is required for principal, teacher, and student
            // Manager and Admin might not belong to a specific school initially (or Manager can be multi-school)
            return ['principal', 'teacher', 'student'].includes(this.role);
        }
    },
    class: {
        type: Number,
        min: 1,
        max: 12,
        required: function () {
            return this.role === 'student';
        }
    },
    subject: {
        type: String,
        trim: true,
        required: function () {
            return this.role === 'teacher';
        }
    },
    rollNumber: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isSuspended: {
        type: Boolean,
        default: false
    },
    resetPasswordOtp: String,
    resetPasswordExpire: Date
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
