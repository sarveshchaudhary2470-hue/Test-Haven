const StudyMaterial = require('../models/StudyMaterial');
const User = require('../models/User');

// Get all study materials (filtered by user role)
exports.getStudyMaterials = async (req, res) => {
    try {
        const { role, school, class: userClass } = req.user;

        let query = { isActive: true };

        // Students see materials for their class and school
        if (role === 'student') {
            query.class = userClass;
            query.schools = school;
        }
        // Principals and Teachers see materials for their school
        else if (role === 'principal' || role === 'teacher') {
            query.schools = school;
        }
        // Admins see all materials (no additional filter)

        const materials = await StudyMaterial.find(query)
            .populate('uploadedBy', 'name email role')
            .populate('schools', 'name')
            .sort({ createdAt: -1 });

        res.json(materials);
    } catch (error) {
        console.error('Error fetching study materials:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Create study material (Admin and Principal)
exports.createStudyMaterial = async (req, res) => {
    try {
        const { role, school } = req.user;

        // Only admins, principals, and teachers can create study materials
        if (role !== 'admin' && role !== 'principal' && role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { title, subject, description, fileUrl, fileData, fileName, fileType, fileSize, class: materialClass, schools } = req.body;

        let finalFileUrl = fileUrl;

        // Handle Base64 file upload
        if (fileData) {
            const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const buffer = Buffer.from(matches[2], 'base64');
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const extension = path.extname(fileName) || '.pdf'; // Default to pdf if no extension
                const newFileName = 'material-' + uniqueSuffix + extension;
                const filePath = path.join(uploadDir, newFileName);

                fs.writeFileSync(filePath, buffer);
                finalFileUrl = '/uploads/' + newFileName;
            }
        }

        // If principal or teacher, auto-set school and add 7-day expiry
        let finalSchools = schools;
        let expiresAt = null;

        if (role === 'principal' || role === 'teacher') {
            finalSchools = [school._id || school];
            // Set expiry to 7 days from now
            expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }

        // Ensure fileUrl is set (either from upload or provided)
        if (!finalFileUrl) {
            finalFileUrl = '/uploads/placeholder.pdf'; // Default placeholder
        }

        // Ensure fileSize is set
        const finalFileSize = fileSize || '0 MB';

        // Convert empty class to null to avoid validation errors
        const finalClass = materialClass ? parseInt(materialClass) : null;

        console.log('📝 Creating study material with:', {
            title,
            subject,
            description,
            finalFileUrl,
            fileType,
            finalFileSize,
            finalClass,
            finalSchools,
            uploadedBy: req.user._id,
            expiresAt
        });

        const material = await StudyMaterial.create({
            title,
            subject,
            description,
            fileUrl: finalFileUrl,
            fileType,
            fileSize: finalFileSize,
            class: finalClass,
            schools: finalSchools,
            uploadedBy: req.user._id,
            expiresAt
        });

        await material.populate('uploadedBy', 'name email');
        await material.populate('schools', 'name');

        res.status(201).json(material);
    } catch (error) {
        console.error('❌ Error creating study material:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            errors: error.errors
        });
        console.error('Request user:', {
            role: req.user?.role,
            school: req.user?.school,
            schoolId: req.user?.school?._id
        });
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            details: error.errors
        });
    }
};

// Update study material (Admin only)
exports.updateStudyMaterial = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can update study materials' });
        }

        const { id } = req.params;
        const updates = req.body;

        const material = await StudyMaterial.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        )
            .populate('uploadedBy', 'name email')
            .populate('schools', 'name');

        if (!material) {
            return res.status(404).json({ message: 'Study material not found' });
        }

        res.json(material);
    } catch (error) {
        console.error('Error updating study material:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete study material (Admin only)
exports.deleteStudyMaterial = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'principal' && req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Not authorized to delete study materials' });
        }

        const { id } = req.params;

        const materialToCheck = await StudyMaterial.findById(id);
        if (!materialToCheck) {
            return res.status(404).json({ message: 'Study material not found' });
        }

        // Teachers can only delete their own materials
        if (req.user.role === 'teacher' && materialToCheck.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this study material' });
        }

        const material = await StudyMaterial.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!material) {
            return res.status(404).json({ message: 'Study material not found' });
        }

        res.json({ message: 'Study material deleted successfully' });
    } catch (error) {
        console.error('Error deleting study material:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
