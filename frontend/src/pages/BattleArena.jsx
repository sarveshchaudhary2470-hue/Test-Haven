import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, Shield, Trophy, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

let socket;

const BattleArena = () => {
    const { user } = useAuth();
    const { roomId } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();

    const [gameStarted, setGameStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [myScore, setMyScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [opponentName, setOpponentName] = useState("Opponent");
    const [opponentSchool, setOpponentSchool] = useState("Unknown");
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [locked, setLocked] = useState(false); // To prevent double answering

    useEffect(() => {
        // Init Socket
        const token = localStorage.getItem('token');
        socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            auth: { token }
        });

        // Set Opponent Details from State
        if (state?.opponent) {
            const oppId = Object.keys(state.opponent).find(id => id !== socket.id); // This might need adjustment based on how socket connects
            // For simplicity, we just take the first value that isn't 'Me' logic, but since we don't know our socket ID yet fully sync:
            // Let's rely on the server event data structure: { [socketId]: { name, school } }
            // Better to listen for an init event or parse standard passed state
            const oppData = Object.values(state.opponent).find(p => p.name !== user.name);
            if (oppData) {
                setOpponentName(oppData.name);
                setOpponentSchool(oppData.school);
            }
        }

        socket.on('game_start', () => {
            setGameStarted(true);
            playStartSound();
        });

        socket.on('new_question', (data) => {
            setCurrentQuestion(data);
            setTimeLeft(15);
            setLocked(false);
        });

        socket.on('question_timeout', () => {
            setLocked(true);
        });

        socket.on('opponent_answered', () => {
            // Visual cue that opponent answered
            // Maybe a small shake animation on their avatar
        });

        // We need a score sync event. 
        // For 1v1 we can trust local calculation for display speed but server authority is better.
        // Let's add a listener for score updates if the server sends them (it should).

        socket.on('game_over', (data) => {
            setGameOver(true);
            const myFinal = Object.values(data.finalScores).find(p => p.name === user.name);
            const oppFinal = Object.values(data.finalScores).find(p => p.name !== user.name);

            setMyScore(myFinal?.score || 0);
            setOpponentScore(oppFinal?.score || 0);

            if ((myFinal?.score || 0) > (oppFinal?.score || 0)) {
                setWinner('You');
                confetti();
            } else if ((myFinal?.score || 0) < (oppFinal?.score || 0)) {
                setWinner('Opponent');
            } else {
                setWinner('Draw');
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Timer Effect
    useEffect(() => {
        if (timeLeft > 0 && !locked && currentQuestion) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft, locked, currentQuestion]);

    const handleAnswer = (index) => {
        if (locked) return;
        setLocked(true);

        socket.emit('submit_answer', {
            roomId,
            answerIndex: index,
            timeRemaining: timeLeft
        });

        // Optimistic UI Update (Real score comes from server usually, but here we do local for speed)
        // Actually, let's wait for server or just show 'Submitted' state
        // For simplicity in this version, we won't calculate score locally to avoid desync
    };

    const playStartSound = () => {
        // Placeholder for sound
    };

    if (gameOver) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.5 }} animate={{ scale: 1 }}
                    className="bg-white/10 backdrop-blur-md p-8 rounded-3xl text-center border border-white/20"
                >
                    <Trophy className={`w-20 h-20 mx-auto mb-4 ${winner === 'You' ? 'text-yellow-400' : 'text-gray-400'}`} />
                    <h1 className="text-4xl font-black text-white mb-2">
                        {winner === 'You' ? 'VICTORY!' : winner === 'Draw' ? 'DRAW!' : 'DEFEAT'}
                    </h1>
                    <div className="flex gap-8 mt-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-400">You</p>
                            <p className="text-3xl font-bold text-white">{myScore}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-400">{opponentName}</p>
                            <p className="text-3xl font-bold text-white">{opponentScore}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-8 px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-gray-200"
                    >
                        Back to Base
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col pt-16 px-4">
            {/* Split Header */}
            <div className="flex justify-between items-center mb-8">
                {/* My Stats */}
                <div className="bg-blue-600/20 border border-blue-500/30 p-4 rounded-xl backdrop-blur-sm min-w-[120px]">
                    <p className="text-blue-300 text-xs font-bold uppercase mb-1">You</p>
                    <p className="text-white font-bold text-lg leading-none">{user?.name}</p>
                    <p className="text-3xl font-black text-white mt-2">{myScore}</p>
                    <div className="flex gap-1 mt-1">
                        {[...Array(streak)].map((_, i) => (
                            <Zap key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                        ))}
                    </div>
                </div>

                {/* VS / Timer */}
                <div className="text-center relative">
                    <div className={`text-4xl font-black ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {timeLeft}
                    </div>
                    <p className="text-xs text-gray-500 font-bold uppercase mt-1">Seconds</p>
                </div>

                {/* Opponent Stats */}
                <div className="bg-red-600/20 border border-red-500/30 p-4 rounded-xl backdrop-blur-sm min-w-[120px] text-right">
                    <p className="text-red-300 text-xs font-bold uppercase mb-1">{opponentSchool}</p>
                    <p className="text-white font-bold text-lg leading-none">{opponentName}</p>
                    <p className="text-3xl font-black text-white mt-2">???</p> {/* Hide score for suspense? Or show it? Design choice. Let's hide exact score */}
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full pb-10">
                <AnimatePresence mode="wait">
                    {currentQuestion ? (
                        <motion.div
                            key={currentQuestion.index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full"
                        >
                            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl mb-6 shadow-2xl">
                                <h2 className="text-xl md:text-2xl font-bold text-white text-center">
                                    {currentQuestion.question}
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQuestion.options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        disabled={locked}
                                        onClick={() => handleAnswer(idx)}
                                        className={`p-4 rounded-2xl font-bold text-lg transition-all transform active:scale-95
                                            ${locked
                                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                : 'bg-white/10 text-white hover:bg-white/20 hover:border-purple-500 border border-transparent'
                                            }
                                        `}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="text-center text-gray-400 animate-pulse">
                            Prepare for battle...
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default BattleArena;
