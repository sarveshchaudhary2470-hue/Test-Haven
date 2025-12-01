require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const School = require('./models/School');
const Test = require('./models/Test');

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany({});
        await School.deleteMany({});
        await Test.deleteMany({});

        console.log('Cleared existing data');

        // Create Schools
        const school1 = await School.create({
            name: 'Delhi Public School',
            code: 'DPS001',
            address: 'New Delhi',
            contactEmail: 'contact@dps.edu',
            contactPhone: '+91 9876543210'
        });

        const school2 = await School.create({
            name: 'Modern School',
            code: 'MS001',
            address: 'Mumbai',
            contactEmail: 'info@modernschool.edu',
            contactPhone: '+91 9876543211'
        });

        console.log('Schools created');

        // Create Admin
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@eduxpress.com',
            password: 'admin123',
            role: 'admin'
        });

        console.log('Admin created');

        // Create Principals
        const principal1 = await User.create({
            name: 'Principal DPS',
            email: 'principal@dps.edu',
            password: 'principal123',
            role: 'principal',
            school: school1._id
        });

        const principal2 = await User.create({
            name: 'Principal Modern',
            email: 'principal@modernschool.edu',
            password: 'principal123',
            role: 'principal',
            school: school2._id
        });

        console.log('Principals created');

        // Create Students
        const students = [];
        for (let i = 1; i <= 10; i++) {
            const school = i <= 5 ? school1 : school2;
            const student = await User.create({
                name: `Student ${i}`,
                email: `student${i}@school.com`,
                password: 'student123',
                role: 'student',
                school: school._id,
                class: Math.floor(Math.random() * 12) + 1,
                rollNumber: `STU${i.toString().padStart(3, '0')}`
            });
            students.push(student);
        }

        console.log('Students created');

        // Create Tests
        const test1 = await Test.create({
            title: 'Mathematics Mid-Term Exam',
            description: 'Comprehensive mathematics test covering algebra and geometry',
            class: 10,
            subject: 'Mathematics',
            duration: 60,
            totalMarks: 100,
            schools: [school1._id, school2._id],
            createdBy: admin._id,
            questions: [
                {
                    question: 'What is 2 + 2?',
                    options: ['3', '4', '5', '6'],
                    correctAnswer: 1
                },
                {
                    question: 'What is the value of π (pi) approximately?',
                    options: ['2.14', '3.14', '4.14', '5.14'],
                    correctAnswer: 1
                },
                {
                    question: 'What is the square root of 144?',
                    options: ['10', '11', '12', '13'],
                    correctAnswer: 2
                },
                {
                    question: 'What is 15 × 3?',
                    options: ['35', '40', '45', '50'],
                    correctAnswer: 2
                },
                {
                    question: 'What is the perimeter of a square with side 5 cm?',
                    options: ['15 cm', '20 cm', '25 cm', '30 cm'],
                    correctAnswer: 1
                }
            ]
        });

        const test2 = await Test.create({
            title: 'Science Quiz - Class 8',
            description: 'General science quiz covering physics, chemistry, and biology',
            class: 8,
            subject: 'Science',
            duration: 45,
            totalMarks: 50,
            schools: [school1._id],
            createdBy: admin._id,
            questions: [
                {
                    question: 'What is the chemical symbol for water?',
                    options: ['H2O', 'CO2', 'O2', 'N2'],
                    correctAnswer: 0
                },
                {
                    question: 'What planet is known as the Red Planet?',
                    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
                    correctAnswer: 1
                },
                {
                    question: 'What is the powerhouse of the cell?',
                    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Chloroplast'],
                    correctAnswer: 2
                },
                {
                    question: 'What gas do plants absorb from the atmosphere?',
                    options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
                    correctAnswer: 2
                },
                {
                    question: 'What is the speed of light?',
                    options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'],
                    correctAnswer: 0
                }
            ]
        });

        console.log('Tests created');

        console.log('\n=== SEED DATA SUMMARY ===');
        console.log(`Schools: ${2}`);
        console.log(`Admin: ${1}`);
        console.log(`Principals: ${2}`);
        console.log(`Students: ${students.length}`);
        console.log(`Tests: ${2}`);
        console.log('\n=== LOGIN CREDENTIALS ===');
        console.log('Admin: admin@eduxpress.com / admin123');
        console.log('Principal (DPS): principal@dps.edu / principal123');
        console.log('Principal (Modern): principal@modernschool.edu / principal123');
        console.log('Student: student1@school.com / student123 (or student2, student3, etc.)');
        console.log('========================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
