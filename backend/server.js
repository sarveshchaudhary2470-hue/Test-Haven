require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
const helmet = require('helmet');
const compression = require('compression');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const testRoutes = require('./routes/testRoutes');
const resultRoutes = require('./routes/resultRoutes');
const studyMaterialRoutes = require('./routes/studyMaterials');
const notificationRoutes = require('./routes/notifications');
const studentRoutes = require('./routes/students');
const exportRoutes = require('./routes/export');
const teacherRoutes = require('./routes/teachers');
const managerRoutes = require('./routes/managers');
const analyticsRoutes = require('./routes/analyticsRoutes');
const superContestRoutes = require('./routes/superContestRoutes');
const contactRoutes = require('./routes/contactRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { protect } = require('./middleware/authMiddleware');
const testScheduler = require('./services/testScheduler');

// Connect to database
connectDB();

// Start test scheduler
testScheduler.start();

const app = express();

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Middleware
app.use((req, res, next) => {
    console.log(`[GLOBAL LOG] ${req.method} ${req.url}`);
    next();
});
app.use(helmet()); // Security headers
app.use(compression()); // GZIP compression
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '10kb' })); // Body size limit
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Rate Limiting
app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/study-materials', studyMaterialRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/managers', managerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/super-contests', superContestRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/ai', aiRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'EduXpress API is running' });
});

// Temporary Seed Route
app.get('/api/seed-users', async (req, res) => {
    try {
        const User = require('./models/User');
        const School = require('./models/School');

        // Create School
        let school = await School.findOne({ code: 'DPS001' });
        if (!school) {
            school = await School.create({
                name: 'Delhi Public School',
                code: 'DPS001',
                address: 'New Delhi',
                contactNumber: '9876543210',
                email: 'principal@dps.edu',
                isActive: true
            });
        }

        const users = [
            { name: 'Admin User', email: 'admin@eduxpress.com', password: 'admin123', role: 'admin' },
            { name: 'Principal User', email: 'principal@dps.edu', password: 'principal123', role: 'principal', school: school._id },
            { name: 'Student User', email: 'student1@school.com', password: 'student123', role: 'student', school: school._id, class: 10, rollNumber: '101' },
            { name: 'Teacher User', email: 'teacher@school.com', password: 'teacher123', role: 'teacher', school: school._id },
            { name: 'Manager User', email: 'manager@eduxpress.com', password: 'manager123', role: 'manager', school: school._id }
        ];

        const results = [];
        for (const u of users) {
            let user = await User.findOne({ email: u.email });
            if (!user) {
                user = await User.create(u);
                results.push(`Created: ${u.role}`);
            } else {
                user.password = u.password;
                user.role = u.role;
                user.school = u.school;
                if (u.class) user.class = u.class;
                await user.save();
                results.push(`Updated: ${u.role}`);
            }
        }
        res.json({ message: 'Seeding complete', results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    // Any route that is not an API route will be handled by the frontend
    app.get(/(.*)/, (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Force restart
// Force restart 2
// Force restart 3
// Force restart 4
// Force restart 5
// Force restart 6
// Force restart 7
// Force restart 8
// Force restart 9
// Force restart 10
// Force restart 11
// Force restart 12
// Force restart 13
// Force restart 14
// Force restart 15
