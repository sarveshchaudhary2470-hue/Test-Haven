const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email }).populate('school', 'name code');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if account is active
        if (!user.isActive || user.isSuspended) {
            return res.status(401).json({ message: 'Account is inactive or suspended' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Return user data and token
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            school: user.school,
            class: user.class,
            subject: user.subject,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password').populate('school', 'name code');
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Forgot Password (Admin Only)
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // RESTRICT TO ADMIN AND PRINCIPAL
        if (!['admin', 'principal'].includes(user.role)) {
            return res.status(403).json({ message: 'You are not authorized to perform this action.' });
        }

        // Generate OTP (6 digits)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to database (valid for 10 minutes)
        user.resetPasswordOtp = otp;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();

        // Send Email
        const message = `Your Password Reset OTP is: ${otp}\n\nIt is valid for 10 minutes.`;

        try {
            const sendEmail = require('../utils/emailService');
            await sendEmail({
                email: user.email,
                subject: 'TestHaven Password Reset OTP',
                message
            });

            res.json({ success: true, message: 'OTP sent to email' });
        } catch (error) {
            user.resetPasswordOtp = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset Password
// @access  Public
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        const user = await User.findOne({
            email,
            resetPasswordOtp: otp,
            resetPasswordExpire: { $gt: Date.now() } // Check if not expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Set new password
        user.password = password;
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
