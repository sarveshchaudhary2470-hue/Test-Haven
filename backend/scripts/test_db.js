// const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('URI:', process.env.MONGO_URI);
console.log('Script finished successfully');
process.exit(0);
/*
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
*/
