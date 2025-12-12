const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const School = require('./models/School');
const BattleEvent = require('./models/BattleEvent');
const { generateBattleQuestions } = require('./controllers/aiController');

let io;
const waitingQueue = {}; // { classNum: [socketId, socketId] }
const activeRooms = {}; // { roomId: { players, questions, scores, currentQ } }
const playerMap = {}; // socketId -> userId

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
        playerMap[socket.id] = socket.user._id;

        // --- FIND MATCH ---
        socket.on('find_match', async () => {
            const classNum = socket.user.class;

            // Check if queue exists
            if (!waitingQueue[classNum]) waitingQueue[classNum] = [];

            // Add to queue
            waitingQueue[classNum].push(socket);

            // Try to match
            if (waitingQueue[classNum].length >= 2) {
                const player1 = waitingQueue[classNum].shift();
                const player2 = waitingQueue[classNum].shift();

                // Create Room
                const roomId = `battle_${Date.now()}_${classNum}`;
                player1.join(roomId);
                player2.join(roomId);

                // Generate Questions
                const questions = await generateBattleQuestions(classNum);

                // Init Room State
                activeRooms[roomId] = {
                    players: {
                        [player1.id]: { name: player1.user.name, score: 0, streak: 0, school: player1.user.school?.name },
                        [player2.id]: { name: player2.user.name, score: 0, streak: 0, school: player2.user.school?.name }
                    },
                    questions: questions,
                    currentQuestionIndex: 0,
                    startTime: Date.now()
                };

                // Notify Players
                io.to(roomId).emit('match_found', {
                    roomId,
                    opponent: {
                        [player1.id]: { name: player2.user.name, school: player2.user.school?.name },
                        [player2.id]: { name: player1.user.name, school: player1.user.school?.name }
                    }
                });

                // Start Game after delay
                setTimeout(() => {
                    io.to(roomId).emit('game_start', { totalQuestions: 20 });
                    sendNextQuestion(roomId);
                }, 3000);
            } else {
                // If Waiting for > 30s, trigger Bot
                setTimeout(() => {
                    if (waitingQueue[classNum].includes(socket)) {
                        startBotMatch(socket, classNum);
                    }
                }, 30000);
            }
        });

        // --- SUBMIT ANSWER ---
        socket.on('submit_answer', ({ roomId, answerIndex, timeRemaining }) => {
            const room = activeRooms[roomId];
            if (!room) return;

            const playerState = room.players[socket.id];
            const currentQ = room.questions[room.currentQuestionIndex];
            const isCorrect = answerIndex === currentQ.correctAnswer;

            // Update Score
            if (isCorrect) {
                let points = 10;
                points += Math.floor(timeRemaining / 2); // Time Bonus
                playerState.streak++;

                if (playerState.streak >= 3) points *= 2; // Multiplier

                playerState.score += points;
            } else {
                playerState.score = Math.max(0, playerState.score - 5); // Negative marking
                playerState.streak = 0;
            }

            // Notify Opponent (Blind update)
            socket.to(roomId).emit('opponent_answered', { isCorrect: null }); // Hide correctness for suspense

            // Check if both answered (Add logic here if needed or just wait for timer)
        });

        socket.on('disconnect', () => {
            // Remove from queue
            for (const cls in waitingQueue) {
                waitingQueue[cls] = waitingQueue[cls].filter(s => s.id !== socket.id);
            }
            console.log("User disconnected");
        });
    });
};

const sendNextQuestion = (roomId) => {
    const room = activeRooms[roomId];
    if (!room) return;

    if (room.currentQuestionIndex >= room.questions.length) {
        io.to(roomId).emit('game_over', {
            finalScores: room.players
        });
        delete activeRooms[roomId];
        return;
    }

    const question = room.questions[room.currentQuestionIndex];
    io.to(roomId).emit('new_question', {
        question: question.question,
        options: question.options,
        index: room.currentQuestionIndex,
        timeLeft: 15
    });

    // Timeout for next question
    setTimeout(() => {
        room.currentQuestionIndex++;
        io.to(roomId).emit('question_timeout');

        setTimeout(() => {
            sendNextQuestion(roomId);
        }, 3000); // 3s Break between questions
    }, 15000 + 3000);
};

const startBotMatch = async (socket, classNum) => {
    // Remove from queue
    waitingQueue[classNum] = waitingQueue[classNum].filter(s => s.id !== socket.id);

    const roomId = `bot_battle_${socket.id}`;
    socket.join(roomId);

    const questions = await generateBattleQuestions(classNum);

    // Virtual Bot Player
    activeRooms[roomId] = {
        players: {
            [socket.id]: { name: socket.user.name, score: 0, streak: 0 },
            'bot': { name: "AI Trainer", score: 0, streak: 0, isBot: true }
        },
        questions: questions,
        currentQuestionIndex: 0
    };

    socket.emit('match_found', {
        roomId,
        opponent: { [socket.id]: { name: "AI Trainer 🤖", school: "EduXpress Academy" } }
    });

    setTimeout(() => {
        socket.emit('game_start', { totalQuestions: 20 });
        sendNextQuestion(roomId);
        // Start Bot Loop logic here...
    }, 3000);
};

module.exports = { initSocket };
