const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getNotifications,
    createNotification,
    markAsRead,
    updateNotification,
    deleteNotification,
    getAllNotifications
} = require('../controllers/notificationController');

// All routes require authentication
router.use(protect);

// Get notifications for current user
router.get('/', getNotifications);

// Get all notifications (Admin only)
router.get('/all', getAllNotifications);

// Create notification (Admin only)
router.post('/', createNotification);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Update notification (Admin only)
router.put('/:id', updateNotification);

// Delete notification (Admin only)
router.delete('/:id', deleteNotification);

module.exports = router;
