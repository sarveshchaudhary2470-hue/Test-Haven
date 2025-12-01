const mongoose = require('mongoose');
const dotenv = require('dotenv');
const School = require('./models/School');
const User = require('./models/User');

dotenv.config();

const createDummyData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Create Dummy School
        let school = await School.findOne({ code: 'DUMMY001' });
        if (!school) {
            school = await School.create({
                name: 'EduXpress Demo School',
                code: 'DUMMY001',
                address: '123 Demo Lane, Tech City',
                contactEmail: 'info@eduxpress.demo',
                contactPhone: '9876543210',
                maxClass: 12
            });
            console.log('✅ Created Dummy School');
        } else {
            console.log('ℹ️ Dummy School already exists');
        }

        // 2. Create Dummy Teacher
        const teacherEmail = 'teacher@eduxpress.com';
        let teacher = await User.findOne({ email: teacherEmail });
        if (!teacher) {
            teacher = await User.create({
                name: 'Demo Teacher',
                email: teacherEmail,
                password: 'password123',
                role: 'teacher',
                school: school._id,
                phoneNumber: '9998887776'
            });
            console.log('✅ Created Dummy Teacher');
        } else {
            // Update password if exists to ensure we know it
            teacher.password = 'password123';
            await teacher.save();
            console.log('ℹ️ Dummy Teacher updated');
        }

        // 3. Create Dummy Manager
        const managerEmail = 'manager@eduxpress.com';
        let manager = await User.findOne({ email: managerEmail });
        if (!manager) {
            manager = await User.create({
                name: 'Demo Manager',
                email: managerEmail,
                password: 'password123',
                role: 'manager',
                phoneNumber: '5556667778'
            });
            console.log('✅ Created Dummy Manager');
        } else {
            // Update password if exists to ensure we know it
            manager.password = 'password123';
            await manager.save();
            console.log('ℹ️ Dummy Manager updated');
        }

        console.log('\n--- CREDENTIALS ---');
        console.log('Teacher: ' + teacherEmail + ' / password123');
        console.log('Manager: ' + managerEmail + ' / password123');
        console.log('-------------------\n');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createDummyData();
