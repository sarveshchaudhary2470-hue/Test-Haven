const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get question-wise performance for a test
router.get('/test/:testId/questions', protect, authorize('admin', 'principal', 'teacher', 'manager'), async (req, res) => {
    try {
        const stats = await analyticsService.getQuestionWisePerformance(req.params.testId);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching question-wise performance', error: error.message });
    }
});

// Get class comparison for a test
router.get('/test/:testId/class-comparison', protect, authorize('admin', 'principal', 'teacher', 'manager'), async (req, res) => {
    try {
        const stats = await analyticsService.getClassComparison(req.params.testId);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching class comparison', error: error.message });
    }
});

// Get student performance trend
router.get('/student/:studentId/trend', protect, async (req, res) => {
    try {
        const { subject, limit } = req.query;
        const trend = await analyticsService.getStudentPerformanceTrend(
            req.params.studentId,
            subject,
            parseInt(limit) || 10
        );
        res.json(trend);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching performance trend', error: error.message });
    }
});

// Get top performers for a test
router.get('/test/:testId/top-performers', protect, authorize('admin', 'principal', 'teacher', 'manager'), async (req, res) => {
    try {
        const { limit } = req.query;
        const topPerformers = await analyticsService.getTopPerformers(
            req.params.testId,
            parseInt(limit) || 10
        );
        res.json(topPerformers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching top performers', error: error.message });
    }
});

// Calculate ranks for a test
router.post('/test/:testId/calculate-ranks', protect, authorize('admin', 'principal', 'manager'), async (req, res) => {
    try {
        const result = await analyticsService.calculateRanks(req.params.testId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error calculating ranks', error: error.message });
    }
});

// Get school performance
router.get('/school/:schoolId/performance', protect, authorize('admin', 'principal'), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const performance = await analyticsService.getSchoolPerformance(
            req.params.schoolId,
            startDate,
            endDate
        );
        res.json(performance);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching school performance', error: error.message });
    }
});

module.exports = router;
