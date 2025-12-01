const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { addTeacher, getTeachers } = require('../controllers/teacherController');

router.use(protect);

router.post('/', addTeacher);
router.get('/', getTeachers);

module.exports = router;
