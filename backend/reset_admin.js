const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const resetAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'sarveshchaudhary2470@gmail.com';
        const password = '123456';

        // Find existing admin or create new
        let admin = await User.findOne({ role: 'admin' });

        if (admin) {
            console.log('Found existing admin. Updating credentials...');
            admin.email = email;
            admin.password = password; // Will be hashed by pre-save hook
            await admin.save();
            console.log('✅ Admin credentials updated successfully!');
        } else {
            console.log('Admin not found. Creating new admin...');
            await User.create({
                name: 'Admin',
                email: email,
                password: password,
                role: 'admin'
            });
            console.log('✅ New Admin created successfully!');
        }

        console.log(`\nLogin Details:\nEmail: ${email}\nPassword: ${password}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

resetAdmin();
