const fs = require('fs');
const path = require('path');

const envContent = `MONGODB_URI=mongodb://127.0.0.1:27017/eduxpress
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
GEMINI_API_KEY=AIzaSyC8I2cAJg118ODUWZQpOH_7hZCIOyBVCvQ`;

fs.writeFileSync(path.join(__dirname, '.env'), envContent);
console.log('Written .env successfully');
