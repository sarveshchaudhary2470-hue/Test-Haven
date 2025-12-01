const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    fileUrl: {
        type: String
    },
    fileType: {
        type: String,
        enum: ['PDF', 'DOC', 'PPT', 'VIDEO', 'OTHER'],
        default: 'PDF'
    },
    fileSize: {
        type: String
    },
    class: {
        type: Number
    },
    schools: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School'
    }],
    uploadedBy: {
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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
