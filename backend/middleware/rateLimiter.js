const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // Greatly increased limit
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many requests from this IP, please try again after 15 minutes'
    }
});

// Stricter limiter for auth routes (login/register)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10000, // Greatly increased limit
    message: {
        message: 'Too many login attempts from this IP, please try again after an hour'
    }
});

// File upload limiter
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // Increased limit
    message: {
        message: 'Upload limit exceeded, please try again later'
    }
});

module.exports = {
    apiLimiter,
    authLimiter,
    uploadLimiter
};
