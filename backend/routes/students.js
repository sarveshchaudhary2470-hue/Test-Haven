const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getSchoolStudents,
    suspendStudent,
    activateStudent,
    deleteStudent,
    addStudent
} = require('../controllers/studentController');

// All routes require authentication
router.use(protect);

// Add new student
router.post('/', addStudent);

// Get students in school
router.get('/school', getSchoolStudents);

// Suspend student
router.put('/:id/suspend', suspendStudent);

// Activate student
router.put('/:id/activate', activateStudent);

// Delete student
router.delete('/:id', deleteStudent);

module.exports = router;
