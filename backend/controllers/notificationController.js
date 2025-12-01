const Notification = require('../models/Notification');

// Get notifications for current user
exports.getNotifications = async (req, res) => {
    try {
        const { role, school, class: userClass, _id } = req.user;

        let query = {
            isActive: true,
            $or: [
                { 'targetAudience.role': 'all' },
                { 'targetAudience.role': role },
                { createdBy: _id }
            ]
        };

        // Add school filter for students, principals, and teachers
        if (role === 'student' || role === 'principal' || role === 'teacher') {
            query['targetAudience.schools'] = { $in: [school, []] };
        }

        // Add class filter for students
        if (role === 'student') {
            query.$and = [
                {
                    $or: [
                        { 'targetAudience.classes': { $in: [userClass] } },
                        { 'targetAudience.classes': { $size: 0 } }
                    ]
                }
            ];
        }

        // Check if not expired
        query.$or.push({ expiresAt: { $exists: false } });
        query.$or.push({ expiresAt: { $gt: new Date() } });

        const notifications = await Notification.find(query)
            .populate('createdBy', 'name email role')
            .sort({ createdAt: -1 })
            .limit(50);

        // Add read status for each notification
        const notificationsWithReadStatus = notifications.map(notification => {
            const isRead = notification.readBy.some(read => read.user.toString() === _id.toString());
            return {
                ...notification.toObject(),
                isRead,
                readAt: isRead ? notification.readBy.find(read => read.user.toString() === _id.toString()).readAt : null
            };
        });

        res.json(notificationsWithReadStatus);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create notification (Admin and Principal)
exports.createNotification = async (req, res) => {
    try {
        const { role, school } = req.user;

        // Only admins, principals, and teachers can create notifications
        if (role !== 'admin' && role !== 'principal' && role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { title, message, type, priority, targetAudience, expiresAt } = req.body;

        // If principal or teacher, auto-set school and role to student
        let finalTargetAudience = targetAudience;
        if (role === 'principal' || role === 'teacher') {
            finalTargetAudience = {
                role: 'student',
                schools: [school._id || school],
                classes: targetAudience?.classes || []
            };
        }

        const notification = await Notification.create({
            title,
            message,
            type,
            priority,
            targetAudience: finalTargetAudience,
            expiresAt,
            createdBy: req.user._id
        });

        await notification.populate('createdBy', 'name email');

        res.status(201).json(notification);
    } catch (error) {
        console.error('❌ Error creating notification:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            errors: error.errors
        });
        console.error('Request user:', {
            role: req.user?.role,
            school: req.user?.school,
            schoolId: req.user?.school?._id
        });
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            details: error.errors
        });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findById(id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Check if already read
        const alreadyRead = notification.readBy.some(read => read.user.toString() === userId.toString());

        if (!alreadyRead) {
            notification.readBy.push({ user: userId });
            await notification.save();
        }

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update notification (Admin only)
exports.updateNotification = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can update notifications' });
        }

        const { id } = req.params;
        const updates = req.body;

        const notification = await Notification.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email');

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete notification (Admin only)
exports.deleteNotification = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'principal' && req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Not authorized to delete notifications' });
        }

        const { id } = req.params;

        const notification = await Notification.findById(id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Teachers can only delete their own notifications
        if (req.user.role === 'teacher' && notification.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this notification' });
        }

        await Notification.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all notifications (Admin only - for management)
exports.getAllNotifications = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can view all notifications' });
        }

        const notifications = await Notification.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching all notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
