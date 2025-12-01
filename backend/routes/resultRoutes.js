const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Test = require('../models/Test');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/results
// @desc    Get all results (Admin/Manager)
// @access  Private/Admin/Manager
router.get('/', protect, authorize('admin', 'manager'), async (req, res) => {
    try {
        const results = await Result.find()
            .populate('test', 'title subject totalMarks class')
            .populate('student', 'name email rollNumber class')
            .populate('school', 'name code')
            .sort({ submittedAt: -1 });

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/results
// @desc    Submit test result
// @access  Private/Student
router.post('/', protect, authorize('student'), async (req, res) => {
    try {
        const { testId, answers, timeTaken } = req.body;

        // Check if result already exists
        const existingResult = await Result.findOne({
            test: testId,
            student: req.user._id
        });

        if (existingResult) {
            return res.status(400).json({ message: 'Test already submitted' });
        }

        // Get test details
        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Calculate score
        let correctAnswers = 0;
        const processedAnswers = answers.map((answer, index) => {
            const question = test.questions[index];
            const isCorrect = question.correctAnswer === answer.selectedAnswer;
            if (isCorrect) correctAnswers++;

            return {
                questionId: question._id,
                selectedAnswer: answer.selectedAnswer,
                isCorrect
            };
        });

        const totalQuestions = test.questions.length;
        const score = (correctAnswers / totalQuestions) * test.totalMarks;
        const percentage = (correctAnswers / totalQuestions) * 100;

        const result = await Result.create({
            test: testId,
            student: req.user._id,
            school: req.user.school,
            answers: processedAnswers,
            score: Math.round(score * 100) / 100,
            totalQuestions,
            correctAnswers,
            percentage: Math.round(percentage * 100) / 100,
            timeTaken
        });

        const populatedResult = await Result.findById(result._id)
            .populate('test', 'title subject totalMarks')
            .populate('student', 'name email rollNumber class')
            .populate('school', 'name code');

        res.status(201).json(populatedResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/results/my-results
// @desc    Get student's own results
// @access  Private/Student
router.get('/my-results', protect, authorize('student'), async (req, res) => {
    try {
        const results = await Result.find({ student: req.user._id })
            .populate('test', 'title subject totalMarks class')
            .populate('school', 'name code')
            .sort({ submittedAt: -1 });

        // Filter out results where test is null (deleted)
        const validResults = results.filter(result => result.test);

        res.json(validResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/results/test/:testId
// @desc    Get student's result for specific test
// @access  Private/Student
router.get('/test/:testId', protect, authorize('student'), async (req, res) => {
    try {
        const result = await Result.findOne({
            test: req.params.testId,
            student: req.user._id
        })
            .populate('test')
            .populate('student', 'name email rollNumber class')
            .populate('school', 'name code');

        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/results/school/:schoolId
// @desc    Get results for a school (Principal/Teacher/Admin access)
// @access  Private
router.get('/school/:schoolId', protect, authorize('principal', 'admin', 'teacher'), async (req, res) => {
    try {
        // Principals and teachers can only access their own school
        const userSchoolId = req.user.school?._id || req.user.school;
        if ((req.user.role === 'principal' || req.user.role === 'teacher') && req.params.schoolId !== userSchoolId.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const results = await Result.find({ school: req.params.schoolId })
            .populate('test', 'title subject totalMarks class')
            .populate('student', 'name email rollNumber class')
            .populate('school', 'name code')
            .sort({ submittedAt: -1 });

        // Filter out results where test or student is null (deleted)
        const validResults = results.filter(result => result.test && result.student);

        res.json(validResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/results/analytics/:testId
// @desc    Get analytics for a test
// @access  Private/Principal/Admin
router.get('/analytics/:testId', protect, authorize('principal', 'admin'), async (req, res) => {
    try {
        const test = await Test.findById(req.params.testId);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Principals can only access their own school's data
        let filter = { test: req.params.testId };
        if (req.user.role === 'principal') {
            filter.school = req.user.school;
        }

        const results = await Result.find(filter)
            .populate('student', 'name email rollNumber class')
            .populate('school', 'name code');

        // Calculate analytics
        const totalStudents = results.length;
        const averageScore = totalStudents > 0
            ? results.reduce((sum, r) => sum + r.score, 0) / totalStudents
            : 0;
        const averagePercentage = totalStudents > 0
            ? results.reduce((sum, r) => sum + r.percentage, 0) / totalStudents
            : 0;

        // Group by class
        const classwiseData = results.reduce((acc, result) => {
            const className = result.student.class;
            if (!acc[className]) {
                acc[className] = {
                    class: className,
                    students: [],
                    averageScore: 0,
                    averagePercentage: 0
                };
            }
            acc[className].students.push(result);
            return acc;
        }, {});

        // Calculate class averages
        Object.keys(classwiseData).forEach(className => {
            const classData = classwiseData[className];
            const count = classData.students.length;
            classData.averageScore = classData.students.reduce((sum, r) => sum + r.score, 0) / count;
            classData.averagePercentage = classData.students.reduce((sum, r) => sum + r.percentage, 0) / count;
        });

        res.json({
            test: {
                _id: test._id,
                title: test.title,
                subject: test.subject,
                totalMarks: test.totalMarks
            },
            totalStudents,
            averageScore: Math.round(averageScore * 100) / 100,
            averagePercentage: Math.round(averagePercentage * 100) / 100,
            classwiseData: Object.values(classwiseData),
            results
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
