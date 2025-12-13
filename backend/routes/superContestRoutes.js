const express = require('express');
const router = express.Router();
const SuperContest = require('../models/SuperContest');
const SuperContestResult = require('../models/SuperContestResult');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   POST /api/super-contests
// @desc    Create a new super contest
// @access  Private/Admin/Principal/Manager
router.post('/', protect, authorize('admin', 'principal', 'manager'), async (req, res) => {
    try {
        const { title, description, classes, subject, duration, totalMarks, questions, startTime, endTime } = req.body;

        // Determine schools: Use provided schools for admin/manager, otherwise user's school
        let targetSchools = [];
        if (req.user.school) {
            targetSchools.push(req.user.school);
        }

        if ((req.user.role === 'admin' || req.user.role === 'manager') && req.body.schools && req.body.schools.length > 0) {
            targetSchools = req.body.schools;
        }

        if (targetSchools.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one school must be selected'
            });
        }

        const contestData = {
            title,
            description,
            classes,
            subject,
            duration,
            totalMarks,
            questions,
            startTime,
            endTime,
            schools: targetSchools,
            createdBy: req.user._id
        };

        const contest = await SuperContest.create(contestData);

        res.status(201).json({
            success: true,
            data: contest
        });
    } catch (error) {
        console.error('Error creating super contest:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// @route   GET /api/super-contests
// @desc    Get all super contests (filtered by role)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let filter = { isActive: true };

        if (req.user.role === 'student') {
            // Students see contests for their class and their school is in the list
            filter.schools = { $in: [req.user.school] };
            filter.classes = req.user.class;
        } else if (req.user.role === 'principal' || req.user.role === 'teacher') {
            // Principals and teachers see contests for their school
            filter.schools = { $in: [req.user.school] };
        }
        // Admins and managers see all contests

        const contests = await SuperContest.find(filter)
            .populate('schools', 'name code')
            .populate('createdBy', 'name')
            .sort({ startTime: -1 });

        // Get participant count for each contest
        const contestsWithCount = await Promise.all(contests.map(async (contest) => {
            const participantCount = await SuperContestResult.countDocuments({ contest: contest._id });
            return {
                ...contest.toObject(),
                participantCount
            };
        }));

        res.json({
            success: true,
            count: contestsWithCount.length,
            data: contestsWithCount
        });
    } catch (error) {
        console.error('Error fetching super contests:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/super-contests/:id
// @desc    Get single super contest
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const contest = await SuperContest.findById(req.params.id)
            .populate('schools', 'name code')
            .populate('createdBy', 'name');

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Convert to object to modify
        const contestObj = contest.toObject();

        // Check access permissions
        if (req.user.role === 'student') {
            const userSchoolId = req.user.school?._id?.toString() || req.user.school?.toString();
            // Check if user's school is in the allowed schools list
            const isAllowedSchool = contest.schools.some(s =>
                (s._id?.toString() || s.toString()) === userSchoolId
            );

            if (!isAllowedSchool || !contest.classes.includes(req.user.class)) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to access this contest'
                });
            }

            // SECURITY: Strip correct answers for students
            contestObj.questions = contestObj.questions.map(q => {
                const { correctAnswer, ...rest } = q;
                return rest;
            });

        } else if (req.user.role === 'principal' || req.user.role === 'teacher') {
            const userSchoolId = req.user.school?._id?.toString() || req.user.school?.toString();
            const isAllowedSchool = contest.schools.some(s =>
                (s._id?.toString() || s.toString()) === userSchoolId
            );

            if (!isAllowedSchool) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to access this contest'
                });
            }
        }

        res.json({
            success: true,
            data: contestObj
        });
    } catch (error) {
        console.error('Error fetching contest:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/super-contests/:id
// @desc    Delete super contest (cascade deletes results)
// @access  Private/Admin/Principal/Manager
router.delete('/:id', protect, authorize('admin', 'principal', 'manager'), async (req, res) => {
    try {
        const contest = await SuperContest.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Authorization Logic
        const userRole = req.user.role;
        const userId = req.user._id.toString();

        // 1. Admin: Full Access
        if (userRole === 'admin') {
            // Allowed to delete any contest
        }
        // 2. Principal/Manager: School-based Access
        else if (userRole === 'principal' || userRole === 'manager') {
            const userSchoolId = req.user.school?._id ? req.user.school._id.toString() : req.user.school?.toString();

            const isCreator = contest.createdBy.toString() === userId;
            // Check if user's school is one of the contest's schools
            const isRelatedSchool = contest.schools.some(s =>
                (s && (s._id?.toString() === userSchoolId || s.toString() === userSchoolId))
            );

            if (!isCreator && !isRelatedSchool) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to delete this contest'
                });
            }
        }
        // 3. Others: No Access
        else {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this contest'
            });
        }

        // Delete all results first (cascade delete)
        await SuperContestResult.deleteMany({ contest: req.params.id });

        // Delete the contest
        await contest.deleteOne();

        res.json({
            success: true,
            message: 'Contest and all related results deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting contest:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/super-contests/:id/start
// @desc    Start a super contest
// @access  Private/Student
router.post('/:id/start', protect, authorize('student'), async (req, res) => {
    console.time('StartContest');
    try {
        const contest = await SuperContest.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Check if contest is active and within time window
        const now = new Date();
        if (now < contest.startTime || now > contest.endTime) {
            return res.status(400).json({
                success: false,
                message: 'Contest is not currently active'
            });
        }

        // Check if already started or submitted
        let result = await SuperContestResult.findOne({
            contest: req.params.id,
            student: req.user._id
        });

        if (result) {
            if (result.status === 'submitted') {
                return res.status(400).json({
                    success: false,
                    message: 'You have already submitted this contest'
                });
            }
            // If already started, return existing start time
            return res.json({
                success: true,
                message: 'Contest resumed',
                data: {
                    startedAt: result.startedAt,
                    status: result.status,
                    answers: result.answers || []
                }
            });
        }

        // Create new result with 'in-progress' status
        const schoolId = req.user.school?._id || req.user.school;
        console.log('School ID resolved:', schoolId);

        if (!schoolId) {
            console.log('No school ID found');
            return res.status(400).json({
                success: false,
                message: 'Your account is not associated with any school. Please contact support.'
            });
        }

        try {
            console.log('Creating SuperContestResult...');
            result = await SuperContestResult.create({
                contest: req.params.id,
                student: req.user._id,
                school: schoolId,
                answers: [], // Empty initially
                score: 0,
                percentage: 0,
                startedAt: now,
                status: 'in-progress'
            });
            console.log('SuperContestResult created:', result._id);
        } catch (createError) {
            // Handle race condition: if result was created by another request in the meantime
            if (createError.code === 11000) {
                console.log('Duplicate key error caught (Race Condition). Fetching existing result...');
                result = await SuperContestResult.findOne({
                    contest: req.params.id,
                    student: req.user._id
                });

                if (!result) {
                    throw createError; // Should not happen if 11000 occurred
                }
                // Continue to return the existing result
            } else {
                throw createError;
            }
        }

        console.timeEnd('StartContest');
        res.status(201).json({
            success: true,
            message: 'Contest started',
            data: {
                startedAt: result.startedAt,
                status: result.status
            }
        });

    } catch (error) {
        console.log('!!! CAUGHT ERROR IN START ROUTE !!!');
        console.error('Error starting contest:', error);
        console.error(error.stack);
        res.status(500).json({
            success: false,
            message: 'DEBUG ERROR: ' + error.message + ' ::: ' + error.stack
        });
    }
});

// @route   POST /api/super-contests/:id/submit
// @desc    Submit super contest result
// @access  Private/Student
router.post('/:id/submit', protect, authorize('student'), async (req, res) => {
    try {
        console.log(`Processing submit for user ${req.user._id} contest ${req.params.id}`);
        const { answers } = req.body;
        const contest = await SuperContest.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Find the in-progress result
        let result = await SuperContestResult.findOne({
            contest: req.params.id,
            student: req.user._id
        });

        if (!result) {
            console.log(`Submit Error: No result found for contest ${req.params.id}. Creating fallback result.`);
            // Fallback: Create a result if it doesn't exist
            try {
                result = new SuperContestResult({
                    contest: req.params.id,
                    student: req.user._id,
                    school: req.user.school?._id || req.user.school,
                    answers: [],
                    score: 0,
                    percentage: 0,
                    startedAt: new Date(Date.now() - (contest.duration * 60 * 1000)),
                    status: 'in-progress'
                });
                await result.save(); // Save immediately to ensure valid state
                console.log('Fallback result created successfully');
            } catch (fallbackError) {
                console.error('Error creating fallback result:', fallbackError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to initialize submission record: ' + fallbackError.message
                });
            }
        }

        if (result.status === 'submitted') {
            console.log(`Submit Error: Already submitted result ${result._id}`);
            return res.status(400).json({
                success: false,
                message: 'You have already submitted this contest'
            });
        }

        // Calculate time taken on server
        const now = new Date();
        const timeTaken = now - new Date(result.startedAt);

        // Calculate score
        let score = 0;
        contest.questions.forEach((question, index) => {
            if (answers[index] === question.correctAnswer) {
                score += question.marks;
            }
        });

        const percentage = (score / contest.totalMarks) * 100;

        // Update result
        result.answers = answers;
        result.score = score;
        result.percentage = percentage;
        result.timeTaken = timeTaken;
        result.submittedAt = now;
        result.status = 'submitted';

        await result.save();
        console.log(`Contest submitted successfully for user ${req.user._id}. Score: ${score}/${contest.totalMarks}`);

        res.json({
            success: true,
            message: 'Contest submitted successfully',
            data: {
                score,
                percentage,
                rank: result.rank // Rank is calculated in pre-save hook
            }
        });
    } catch (error) {
        console.error('Error submitting contest:', error);
        // Log the full stack trace
        console.error(error.stack);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// @route   GET /api/super-contests/:id/results
// @desc    Get contest leaderboard
// @access  Private/Admin/Principal/Manager
router.get('/:id/results', protect, authorize('admin', 'principal', 'manager'), async (req, res) => {
    try {
        const contest = await SuperContest.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Get all results sorted by rank
        const results = await SuperContestResult.find({ contest: req.params.id })
            .populate('student', 'name class email')
            .populate('school', 'name')
            .sort({ rank: 1 });

        // Format results with time display
        const formattedResults = results.map(result => {
            const totalSeconds = Math.floor(result.timeTaken / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            const milliseconds = result.timeTaken % 1000;

            return {
                ...result.toObject(),
                timeDisplay: `${minutes}m ${seconds}s ${milliseconds}ms`
            };
        });

        res.json({
            success: true,
            count: formattedResults.length,
            data: formattedResults
        });
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/super-contests/:id/my-result
// @desc    Get student's own result
// @access  Private/Student
router.get('/:id/my-result', protect, authorize('student'), async (req, res) => {
    try {
        const result = await SuperContestResult.findOne({
            contest: req.params.id,
            student: req.user._id
        }).populate('contest', 'title totalMarks');

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'No result found'
            });
        }

        const totalSeconds = Math.floor(result.timeTaken / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = result.timeTaken % 1000;

        res.json({
            success: true,
            data: {
                ...result.toObject(),
                timeDisplay: `${minutes}m ${seconds}s ${milliseconds}ms`
            }
        });
    } catch (error) {
        console.error('Error fetching result:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
