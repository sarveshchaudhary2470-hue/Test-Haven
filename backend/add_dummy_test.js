require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Test = require('./models/Test');
const School = require('./models/School');

const addDummyTest = async () => {
    try {
        await connectDB();

        // Find the student
        const studentEmail = 'student1@school.com';
        const student = await User.findOne({ email: studentEmail });

        if (!student) {
            console.log(`Student with email ${studentEmail} not found.`);
            process.exit(1);
        }

        console.log(`Found student: ${student.name}, Class: ${student.class}, School ID: ${student.school}`);

        // Find the admin (to be the creator)
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log('Admin not found.');
            process.exit(1);
        }

        // Create a dummy test for this student's class and school
        const dummyTest = await Test.create({
            title: 'Manual Verification Dummy Test',
            description: 'A simple test to verify the student dashboard and test taking flow.',
            class: student.class,
            subject: 'General Knowledge',
            duration: 15, // 15 minutes
            totalMarks: 20,
            schools: [student.school],
            createdBy: admin._id,
            questions: [
                {
                    question: 'What is the capital of France?',
                    options: ['London', 'Berlin', 'Paris', 'Madrid'],
                    correctAnswer: 2
                },
                {
                    question: 'Which planet is closest to the Sun?',
                    options: ['Venus', 'Mars', 'Mercury', 'Jupiter'],
                    correctAnswer: 2
                },
                {
                    question: 'What is 5 + 7?',
                    options: ['10', '11', '12', '13'],
                    correctAnswer: 2
                },
                {
                    question: 'Who wrote Romeo and Juliet?',
                    options: ['Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Jane Austen'],
                    correctAnswer: 1
                }
            ]
        });

        console.log('Dummy test created successfully!');
        console.log('Test Title:', dummyTest.title);
        console.log('Target Class:', dummyTest.class);
        console.log('Target School:', dummyTest.schools);

        process.exit(0);
    } catch (error) {
        console.error('Error adding dummy test:', error);
        process.exit(1);
    }
};

addDummyTest();
