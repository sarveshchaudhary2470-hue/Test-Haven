const express = require('express');
const router = express.Router();
const User = require('../models/User');
const School = require('../models/School');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   POST /api/admin/schools
// @desc    Create a new school
// @access  Private/Admin
router.post('/schools', protect, authorize('admin'), async (req, res) => {
    try {
        const { name, code, address, contactEmail, contactPhone, maxClass } = req.body;

        const schoolExists = await School.findOne({ code });
        if (schoolExists) {
            return res.status(400).json({ message: 'School code already exists' });
        }

        const school = await School.create({
            name,
            code,
            address,
            contactEmail,
            contactPhone,
            maxClass
        });

        res.status(201).json(school);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/schools
// @desc    Get all schools
// @access  Private/Admin
router.get('/schools', protect, authorize('admin', 'manager'), async (req, res) => {
    try {
        const schools = await School.find({});
        res.json(schools);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/schools/:id
// @desc    Update school
// @access  Private/Admin
router.put('/schools/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const school = await School.findById(req.params.id);

        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        const updatedSchool = await School.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedSchool);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/schools/:id
// @desc    Delete school
// @access  Private/Admin
router.delete('/schools/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const school = await School.findById(req.params.id);

        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        await school.deleteOne();
        res.json({ message: 'School removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/admin/users
// @desc    Create a new user (Principal or Student)
// @access  Private/Admin
router.post('/users', protect, authorize('admin'), async (req, res) => {
    try {
        let { name, email, password, role, school, class: userClass, rollNumber, phoneNumber, subject } = req.body;

        // Sanitize fields to prevent CastErrors
        if (school === '') school = undefined;
        if (userClass === '') userClass = undefined;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            school,
            class: userClass,
            rollNumber,
            phoneNumber,
            subject
        });

        const userResponse = await User.findById(user._id).select('-password').populate('school', 'name code');
        res.status(201).json(userResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
    try {
        const { role, school } = req.query;
        const filter = {};

        if (role) filter.role = role;
        if (school) filter.school = school;

        const users = await User.find(filter).select('-password').populate('school', 'name code');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/users/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Don't allow password update through this route
        delete req.body.password;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-password').populate('school', 'name code');

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/users/:id/suspend
// @desc    Suspend/Unsuspend user
// @access  Private/Admin/Principal
router.put('/users/:id/suspend', protect, authorize('admin', 'principal'), async (req, res) => {
    try {
        const { isSuspended } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isSuspended },
            { new: true }
        ).select('-password').populate('school', 'name code');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin/Principal
router.delete('/users/:id', protect, authorize('admin', 'principal'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();
        res.json({ message: 'User removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
