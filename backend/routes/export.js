const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { exportResults } = require('../controllers/exportController');

// All routes require authentication
router.use(protect);

// Export results
router.get('/results', exportResults);

module.exports = router;
