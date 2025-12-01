const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import Models
const User = require('../models/User');
const School = require('../models/School');
const Test = require('../models/Test');
const QuestionBank = require('../models/QuestionBank');
const SuperContest = require('../models/SuperContest');
const SuperContestResult = require('../models/SuperContestResult');
const Result = require('../models/Result');
const Notification = require('../models/Notification');
const StudyMaterial = require('../models/StudyMaterial');


const seedData = async () => {
    try {
        console.log('🚀 Starting seed script...');
        console.log('📂 Current directory:', process.cwd());
        console.log('📄 Loading .env from:', path.join(__dirname, '../.env'));

        if (!process.env.MONGODB_URI) {
            throw new Error('❌ MONGODB_URI is not defined in .env');
        }
        console.log('🔵 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        console.log('🗑️ Clearing all data...');
        await Promise.all([
            User.deleteMany({}),
            School.deleteMany({}),
            Test.deleteMany({}),
            QuestionBank.deleteMany({}),
            SuperContest.deleteMany({}),
            SuperContestResult.deleteMany({}),
            Result.deleteMany({}),
            Notification.deleteMany({}),
            StudyMaterial.deleteMany({})
        ]);
        console.log('✅ Data cleared');

        let school;
        try {
            console.log('🏫 Creating School...');
            school = await School.create({
                name: 'Delhi Public School',
                code: 'DPS001',
                address: 'Sector 12, RK Puram, New Delhi',
                contactEmail: 'contact@dps.com',
                contactPhone: '9876543210',
                maxClass: 12,
                isActive: true
            });
            console.log('✅ School created:', school.name);
        } catch (err) {
            console.error('❌ Error creating school:', err);
            throw err;
        }

        let users;
        try {
            console.log('👥 Creating Users...');
            // Pass plain text passwords, let the model hash them
            users = await User.create([
                {
                    name: 'Admin User',
                    email: 'admin@eduxpress.com',
                    password: '123456',
                    role: 'admin',
                    isActive: true
                },
                {
                    name: 'Manager User',
                    email: 'manager@eduxpress.com',
                    password: '123456',
                    role: 'manager',
                    isActive: true
                },
                {
                    name: 'Principal User',
                    email: 'principal@dps.com',
                    password: '123456',
                    role: 'principal',
                    school: school._id,
                    isActive: true
                },
                {
                    name: 'Physics Teacher',
                    email: 'teacher@dps.com',
                    password: '123456',
                    role: 'teacher',
                    school: school._id,
                    subject: 'Physics',
                    isActive: true
                },
                {
                    name: 'Rahul Sharma',
                    email: 'student1@dps.com',
                    password: '123456',
                    role: 'student',
                    school: school._id,
                    class: 10,
                    rollNumber: '1001',
                    phoneNumber: '9999999999',
                    isActive: true
                },
                {
                    name: 'Priya Patel',
                    email: 'student2@dps.com',
                    password: '123456',
                    role: 'student',
                    school: school._id,
                    class: 10,
                    rollNumber: '1002',
                    phoneNumber: '8888888888',
                    isActive: true
                }
            ]);
            console.log('✅ Users created:', users.length);
        } catch (err) {
            console.error('❌ Error creating users:', err);
            throw err;
        }

        let questionBank;
        const generatedQuestions = Array.from({ length: 10 }).map((_, i) => ({
            question: `What is the value of ${i + 1} + ${i + 1}?`,
            options: [
                `${(i + 1) * 2}`,
                `${(i + 1) * 2 + 1}`,
                `${(i + 1) * 2 + 2}`,
                `${(i + 1) * 2 - 1}`
            ],
            correctAnswer: 0,
            difficulty: 'medium',
            topic: 'Arithmetic',
            marks: 10
        }));

        try {
            console.log('❓ Creating Question Bank...');
            questionBank = await QuestionBank.create({
                name: 'Math Question Bank',
                description: 'Standard math questions for Class 10',
                subject: 'Mathematics',
                class: 10,
                questions: generatedQuestions,
                createdBy: users[0]._id, // Admin
                isPublic: true
            });
            console.log('✅ Question Bank created with', questionBank.questions.length, 'questions');
        } catch (err) {
            console.error('❌ Error creating question bank:', err);
            throw err;
        }

        try {
            console.log('🏆 Creating Super Contest...');
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

            const superContest = await SuperContest.create({
                title: 'Math Olympiad 2025',
                description: 'National level mathematics competition',
                subject: 'Mathematics',
                classes: [10],
                duration: 60,
                totalMarks: 100,
                startTime: startTime,
                endTime: endTime,
                questions: generatedQuestions, // Use the same questions array structure
                randomizeQuestions: true,
                randomizeOptions: true,
                createdBy: users[2]._id, // Principal
                school: school._id
            });
            console.log('✅ Super Contest created:', superContest.title);
        } catch (err) {
            console.error('❌ Error creating super contest:', err);
            throw err;
        }

        try {
            console.log('📝 Creating Regular Test...');
            const test = await Test.create({
                title: 'Physics Unit Test 1',
                description: 'Chapter 1: Motion',
                subject: 'Physics',
                class: 10,
                duration: 45,
                totalMarks: 50,
                scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days later
                schools: [school._id],
                questions: generatedQuestions.slice(0, 5), // Use subset
                createdBy: users[3]._id // Teacher
            });
            console.log('✅ Regular Test created:', test.title);
        } catch (err) {
            console.error('❌ Error creating test:', err);
            throw err;
        }

        console.log('\n🎉 SEEDING COMPLETE! 🎉');
        console.log('----------------------------------------');
        console.log('Login Credentials (Password: 123456):');
        console.log('Admin:     admin@eduxpress.com');
        console.log('Manager:   manager@eduxpress.com');
        console.log('Principal: principal@dps.com');
        console.log('Teacher:   teacher@dps.com');
        console.log('Student 1: student1@dps.com');
        console.log('Student 2: student2@dps.com');
        console.log('----------------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('❌ Fatal Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
