const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from current directory
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const School = require('./models/School');
const Test = require('./models/Test');
const Result = require('./models/Result');
const Notification = require('./models/Notification');
const Contact = require('./models/Contact');

const cleanupData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Delete all non-admin users
        const userResult = await User.deleteMany({ role: { $ne: 'admin' } });
        console.log(`🗑️ Deleted ${userResult.deletedCount} non-admin users`);

        // 2. Delete all other collections
        const schoolResult = await School.deleteMany({});
        console.log(`🗑️ Deleted ${schoolResult.deletedCount} schools`);

        const testResult = await Test.deleteMany({});
        console.log(`🗑️ Deleted ${testResult.deletedCount} tests`);

        const resultResult = await Result.deleteMany({});
        console.log(`🗑️ Deleted ${resultResult.deletedCount} results`);

        const notifResult = await Notification.deleteMany({});
        console.log(`🗑️ Deleted ${notifResult.deletedCount} notifications`);

        const contactResult = await Contact.deleteMany({});
        console.log(`🗑️ Deleted ${contactResult.deletedCount} contact messages`);

        // 3. Update Admin Email
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            admin.email = 'sarveshchaudhary2470@gmail.com';
            await admin.save();
            console.log('✅ Admin email updated to: sarveshchaudhary2470@gmail.com');
        } else {
            console.log('⚠️ Admin user not found! Creating one...');
            await User.create({
                name: 'Admin',
                email: 'sarveshchaudhary2470@gmail.com',
                password: 'admin',
                role: 'admin'
            });
            console.log('✅ Created new Admin user');
        }

        console.log('🎉 Database cleanup complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

cleanupData();
