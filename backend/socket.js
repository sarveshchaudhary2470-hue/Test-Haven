const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const School = require('./models/School');


let io;


const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*", // Allow all for now
            methods: ["GET", "POST"]
        }
    });

    console.log("Socket.io initialized");

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error("Authentication error"));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).populate('school');
            if (!user) return next(new Error("User not found"));

            socket.user = user;
            next();
        } catch (err) {
            next(new Error("Authentication error"));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.name} (${socket.id})`);



        socket.on('disconnect', () => {


            console.log("User disconnected");
        });
    });
};



module.exports = { initSocket };
