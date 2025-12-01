const mongoose = require('mongoose');
const User = require('./models/User');
const School = require('./models/School');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const debugUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({}).populate('school');
        console.log('--- Users Debug Info ---');
        users.forEach(u => {
            console.log(`Name: ${u.name}, Role: ${u.role}, Email: ${u.email}`);
            console.log(`School: ${u.school ? u.school.name : 'NONE'} (${u.school ? u.school._id : 'N/A'})`);
            console.log('------------------------');
        });

        const schools = await School.find({});
        console.log('--- Schools ---');
        schools.forEach(s => {
            console.log(`Name: ${s.name}, ID: ${s._id}`);
        });

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugUsers();
