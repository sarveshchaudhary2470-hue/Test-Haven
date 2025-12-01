const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dropIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('notifications');

        // Get all indexes
        const indexes = await collection.indexes();
        console.log('📋 Current indexes:', JSON.stringify(indexes, null, 2));

        // Drop the problematic index
        try {
            await collection.dropIndex('targetAudience.role_1_targetAudience.schools_1_targetAudience.classes_1');
            console.log('✅ Dropped problematic index successfully!');
        } catch (error) {
            console.log('⚠️  Index might not exist or already dropped:', error.message);
        }

        // Show remaining indexes
        const remainingIndexes = await collection.indexes();
        console.log('📋 Remaining indexes:', JSON.stringify(remainingIndexes, null, 2));

        console.log('✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

dropIndex();
