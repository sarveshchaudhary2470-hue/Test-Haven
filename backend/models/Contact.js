const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    message: {
        type: String,
        required: [true, 'Please add a message'],
        validate: {
            validator: function (v) {
                // Split by whitespace and filter out empty strings to count words
                return v.trim().split(/\s+/).filter(word => word.length > 0).length <= 250;
            },
            message: 'Message cannot exceed 250 words'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Contact', ContactSchema);
