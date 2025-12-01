const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getStudyMaterials,
    createStudyMaterial,
    updateStudyMaterial,
    deleteStudyMaterial
} = require('../controllers/studyMaterialController');

// All routes require authentication
router.use(protect);

// Get study materials (filtered by role)
router.get('/', getStudyMaterials);

// Create study material (Admin only)
router.post('/', createStudyMaterial);

// Update study material (Admin only)
router.put('/:id', updateStudyMaterial);

// Delete study material (Admin only)
router.delete('/:id', deleteStudyMaterial);

module.exports = router;
