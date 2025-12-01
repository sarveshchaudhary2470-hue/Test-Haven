const User = require('../models/User');

// Add new teacher
exports.addTeacher = async (req, res) => {
    try {
        const { role, school } = req.user;

        // Only principals and admins can add teachers
        if (role !== 'principal' && role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { name, email, password, class: teacherClass } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Determine school ID
        let schoolId;
        if (role === 'principal') {
            schoolId = (school && school._id) ? school._id : school;
        } else {
            schoolId = req.body.school;
        }

        if (!schoolId) {
            return res.status(400).json({ message: 'School ID is required' });
        }

        const teacher = await User.create({
            name,
            email,
            password,
            role: 'teacher',
            school: schoolId,
            class: teacherClass, // Optional: Assign a class to the teacher
            subject: req.body.subject // Assign subject to the teacher
        });

        if (teacher) {
            res.status(201).json({
                _id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                role: teacher.role,
                school: teacher.school,
                class: teacher.class
            });
        } else {
            res.status(400).json({ message: 'Invalid teacher data' });
        }
    } catch (error) {
        console.error('Error adding teacher:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// Get all teachers
exports.getTeachers = async (req, res) => {
    try {
        const { role, school } = req.user;

        // Only principals and admins can access
        if (role !== 'principal' && role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        let query = { role: 'teacher' };

        // Principals can only see their school's teachers
        if (role === 'principal') {
            const schoolId = (school && school._id) ? school._id : school;
            query.school = schoolId;
        }

        const teachers = await User.find(query)
            .select('-password')
            .populate('school', 'name code')
            .sort({ name: 1 });

        res.json(teachers);
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
