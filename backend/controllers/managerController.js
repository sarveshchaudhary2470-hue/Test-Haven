const User = require('../models/User');

// Add new manager
exports.addManager = async (req, res) => {
    try {
        const { role } = req.user;

        // Only admins can add managers
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { name, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const manager = await User.create({
            name,
            email,
            password,
            role: 'manager'
            // Managers might not be assigned to a specific school initially
        });

        if (manager) {
            res.status(201).json({
                _id: manager._id,
                name: manager.name,
                email: manager.email,
                role: manager.role
            });
        } else {
            res.status(400).json({ message: 'Invalid manager data' });
        }
    } catch (error) {
        console.error('Error adding manager:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// Get all managers
exports.getManagers = async (req, res) => {
    try {
        const { role } = req.user;

        // Only admins can access
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const managers = await User.find({ role: 'manager' })
            .select('-password')
            .sort({ name: 1 });

        res.json(managers);
    } catch (error) {
        console.error('Error fetching managers:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
