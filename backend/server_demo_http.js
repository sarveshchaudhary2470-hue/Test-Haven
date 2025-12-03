const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
// Calculate the correct path to the frontend build directory
const distPath = path.join(__dirname, '../frontend/dist');
const indexPath = path.join(distPath, 'index.html');

const getContentType = (filePath) => {
    const extname = path.extname(filePath);
    switch (extname) {
        case '.html': return 'text/html';
        case '.js': return 'text/javascript';
        case '.css': return 'text/css';
        case '.json': return 'application/json';
        case '.png': return 'image/png';
        case '.jpg': return 'image/jpg';
        case '.svg': return 'image/svg+xml';
        default: return 'application/octet-stream';
    }
};

const server = http.createServer((req, res) => {
    console.log(`Request: ${req.url}`);

    let filePath = path.join(distPath, req.url === '/' ? 'index.html' : req.url);

    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // If file not found, serve index.html (SPA fallback)
            fs.readFile(indexPath, (err, content) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Error loading index.html: ' + err.message);
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(content);
                }
            });
        } else {
            // Serve the file
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Server Error: ' + err.code);
                } else {
                    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
                    res.end(content);
                }
            });
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n>>> DEMO SERVER STARTED <<<`);
    console.log(`Open your browser at: http://localhost:${PORT}`);
    console.log(`(Note: This is a preview server. API calls will not work without DB connection)`);
});
