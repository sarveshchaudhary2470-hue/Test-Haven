const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   POST /api/tests
// @desc    Create a new test
// @access  Private/Admin/Manager/Teacher
router.post('/', protect, authorize('admin', 'manager', 'teacher'), async (req, res) => {
    try {
        const { title, description, class: testClass, subject, duration, totalMarks, questions, schools, scheduledDate } = req.body;

        let assignedSchools = schools;

        // Teachers can only create tests for their own school
        if (req.user.role === 'teacher') {
            assignedSchools = [req.user.school];
        }
        // Managers can assign to multiple schools (passed in body)
        // Admins can assign to multiple schools (passed in body)

        const test = await Test.create({
            title,
            description,
            class: testClass,
            subject,
            duration,
            totalMarks,
            questions,
            schools: assignedSchools,
            scheduledDate,
            createdBy: req.user._id
        });

        res.status(201).json(test);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/tests
// @desc    Get tests (filtered by role)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let filter = { isActive: true };

        if (req.user.role === 'student') {
            // Students see tests for their class and school
            filter.class = req.user.class;
            filter.schools = req.user.school;
        } else if (req.user.role === 'principal' || req.user.role === 'teacher') {
            // Principals and Teachers see tests for their school
            filter.schools = req.user.school;
        }
        // Admins and Managers see all tests (or Managers could be filtered if they have assigned schools)

        const tests = await Test.find(filter)
            .populate('schools', 'name code')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.json(tests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/tests/:id
// @desc    Get single test
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const test = await Test.findById(req.params.id)
            .populate('schools', 'name code')
            .populate('createdBy', 'name');

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Check access permissions
        if (req.user.role === 'student') {
            // Use loose equality for class to handle string/number differences
            // req.user.school is populated, so we need to access ._id
            const studentSchoolId = req.user.school?._id?.toString() || req.user.school?.toString();

            if (test.class != req.user.class || !test.schools.some(s => s._id.toString() === studentSchoolId)) {
                return res.status(403).json({
                    message: 'Not authorized to access this test',
                    debug: {
                        userClass: req.user.class,
                        testClass: test.class,
                        userSchool: studentSchoolId,
                        testSchools: test.schools.map(s => s._id.toString())
                    }
                });
            }
        } else if (req.user.role === 'principal' || req.user.role === 'teacher') {
            const userSchoolId = req.user.school?._id?.toString() || req.user.school?.toString();
            if (!test.schools.some(s => s._id.toString() === userSchoolId)) {
                return res.status(403).json({ message: 'Not authorized to access this test' });
            }
        }

        res.json(test);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/tests/:id
// @desc    Update test
// @access  Private/Admin/Manager/Teacher
router.put('/:id', protect, authorize('admin', 'manager', 'teacher'), async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Teachers can only update their own tests
        if (req.user.role === 'teacher' && test.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this test' });
        }

        const updatedTest = await Test.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('schools', 'name code');

        res.json(updatedTest);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/tests/:id
// @desc    Delete test
// @access  Private/Admin/Manager/Teacher
router.delete('/:id', protect, authorize('admin', 'manager', 'teacher'), async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Teachers can delete tests they created OR tests assigned to their school
        if (req.user.role === 'teacher') {
            const isCreator = test.createdBy.toString() === req.user._id.toString();

            // Handle populated school object or ID string
            const userSchoolId = req.user.school?._id?.toString() || req.user.school?.toString();

            // Check if test belongs to teacher's school
            const isSchoolTest = test.schools.some(s => s.toString() === userSchoolId);

            if (!isCreator && !isSchoolTest) {
                console.log('Delete Test Failed:', {
                    testId: test._id,
                    user: req.user._id,
                    isCreator,
                    isSchoolTest,
                    userSchoolId,
                    testSchools: test.schools
                });
                return res.status(403).json({ message: 'Not authorized to delete this test' });
            }
        }

        await test.deleteOne();
        res.json({ message: 'Test removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
