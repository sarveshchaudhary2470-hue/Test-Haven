const User = require('../models/User');

// Get all students in principal's school
exports.getSchoolStudents = async (req, res) => {
    try {
        const { role, school } = req.user;

        // Only principals, teachers, and admins can access
        if (role !== 'principal' && role !== 'admin' && role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        let query = { role: 'student' };

        // Principals and teachers can only see their school's students
        if (role === 'principal' || role === 'teacher') {
            query.school = school._id || school;
        }

        const students = await User.find(query)
            .select('-password')
            .populate('school', 'name code')
            .sort({ class: 1, name: 1 });

        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Suspend student account
exports.suspendStudent = async (req, res) => {
    try {
        const { role, school } = req.user;
        const { id } = req.params;

        // Only principals and admins can suspend
        if (role !== 'principal' && role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const student = await User.findById(id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (student.role !== 'student') {
            return res.status(400).json({ message: 'Can only suspend student accounts' });
        }

        // Principals can only suspend students from their school
        if (role === 'principal') {
            if (!student.school) {
                console.error('Student has no school assigned:', student._id);
                return res.status(400).json({ message: 'Student has no school assigned' });
            }

            const userSchoolId = (school && school._id) ? school._id : school;
            const studentSchoolId = (student.school && student.school._id) ? student.school._id : student.school;

            console.log('Suspend Check:', {
                userSchoolId: userSchoolId?.toString(),
                studentSchoolId: studentSchoolId?.toString()
            });

            if (studentSchoolId.toString() !== userSchoolId.toString()) {
                return res.status(403).json({ message: 'Can only manage students from your school' });
            }
        }

        student.isSuspended = true;
        await student.save();

        res.json({ message: 'Student account suspended successfully', student });
    } catch (error) {
        console.error('Error suspending student:', error);
        res.status(500).json({ message: 'Server error: ' + error.message, stack: error.stack });
    }
};

// Activate student account
exports.activateStudent = async (req, res) => {
    try {
        const { role, school } = req.user;
        const { id } = req.params;

        // Only principals and admins can activate
        if (role !== 'principal' && role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const student = await User.findById(id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (student.role !== 'student') {
            return res.status(400).json({ message: 'Can only activate student accounts' });
        }

        // Principals can only activate students from their school
        if (role === 'principal') {
            if (!student.school) {
                console.error('Student has no school assigned:', student._id);
                return res.status(400).json({ message: 'Student has no school assigned' });
            }

            const userSchoolId = (school && school._id) ? school._id : school;
            const studentSchoolId = (student.school && student.school._id) ? student.school._id : student.school;

            if (studentSchoolId.toString() !== userSchoolId.toString()) {
                return res.status(403).json({ message: 'Can only manage students from your school' });
            }
        }

        student.isSuspended = false;
        await student.save();

        res.json({ message: 'Student account activated successfully', student });
    } catch (error) {
        console.error('Error activating student:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete student account
exports.deleteStudent = async (req, res) => {
    try {
        const { role, school } = req.user;
        const { id } = req.params;

        // Only principals and admins can delete
        if (role !== 'principal' && role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const student = await User.findById(id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (student.role !== 'student') {
            return res.status(400).json({ message: 'Can only delete student accounts' });
        }

        // Principals can only delete students from their school
        if (role === 'principal') {
            if (!student.school) {
                console.error('Student has no school assigned:', student._id);
                return res.status(400).json({ message: 'Student has no school assigned' });
            }

            const userSchoolId = (school && school._id) ? school._id : school;
            const studentSchoolId = (student.school && student.school._id) ? student.school._id : student.school;

            if (studentSchoolId.toString() !== userSchoolId.toString()) {
                return res.status(403).json({ message: 'Can only manage students from your school' });
            }
        }

        await User.findByIdAndDelete(id);

        res.json({ message: 'Student account deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add new student (Principal only)
exports.addStudent = async (req, res) => {
    try {
        const { role, school } = req.user;

        // Only principals and admins can add students
        if (role !== 'principal' && role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { name, email, password, class: studentClass, rollNumber } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Determine school ID
        let schoolId;
        if (role === 'principal') {
            // Principal can only add to their own school
            schoolId = (school && school._id) ? school._id : school;
        } else {
            // Admin can specify school (or default logic if needed)
            // For now, require school ID in body for admin, or handle as needed
            // This part focuses on Principal flow as requested
            schoolId = req.body.school;
        }

        if (!schoolId) {
            return res.status(400).json({ message: 'School ID is required' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: 'student',
            school: schoolId,
            class: studentClass,
            rollNumber
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                school: user.school,
                class: user.class,
                rollNumber: user.rollNumber
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};
