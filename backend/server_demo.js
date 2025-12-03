const express = require('express');
const path = require('path');
const app = express();

const PORT = 5000;

// 1. Serve Static Files (Frontend)
// Ye wahi logic hai jo production server mein add kiya gaya hai
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// 2. Handle API Routes (Mock)
// Asli backend DB connect nahi kar sakta bina password ke, isliye ye dummy response dega
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Demo Server is Running' });
});

// 3. Catch-All Route (Frontend Routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n>>> DEMO SERVER STARTED <<<`);
    console.log(`Open your browser at: http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to stop`);
});
