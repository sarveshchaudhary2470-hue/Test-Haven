const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require(path.join(__dirname, 'models', 'User'));
const School = require(path.join(__dirname, 'models', 'School'));

const seedUsers = async () => {
    try {
        console.log('Connecting to MongoDB...');
        console.log('URI:', process.env.MONGO_URI);

        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Create a dummy school first
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
            console.log('✅ School created');
        }

        const users = [
            {
                name: 'Admin User',
                email: 'admin@eduxpress.com',
                password: 'admin123',
                role: 'admin',
                isActive: true
            },
            {
                name: 'Principal User',
                email: 'principal@dps.edu',
                password: 'principal123',
                role: 'principal',
                school: school._id,
                isActive: true
            },
            {
                name: 'Student User',
                email: 'student1@school.com',
                password: 'student123',
                role: 'student',
                school: school._id,
                class: 10,
                rollNumber: '101',
                isActive: true
            },
            {
                name: 'Teacher User',
                email: 'teacher@school.com',
                password: 'teacher123',
                role: 'teacher',
                school: school._id,
                isActive: true
            },
            {
                name: 'Manager User',
                email: 'manager@eduxpress.com',
                password: 'manager123',
                role: 'manager',
                school: school._id,
                isActive: true
            }
        ];

        for (const userData of users) {
            const exists = await User.findOne({ email: userData.email });
            if (!exists) {
                await User.create(userData);
                console.log(`✅ Created user: ${userData.role} (${userData.email})`);
            } else {
                exists.password = userData.password;
                exists.role = userData.role;
                exists.isActive = true;
                if (userData.school) exists.school = userData.school;
                await exists.save();
                console.log(`🔄 Updated user: ${userData.role} (${userData.email})`);
            }
        }

        console.log('🎉 All dummy users seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
