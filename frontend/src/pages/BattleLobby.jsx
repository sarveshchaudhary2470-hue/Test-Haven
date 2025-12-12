import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, User, Shield, Zap, Search, Trophy, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

let socket;

const BattleLobby = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searching, setSearching] = useState(false);
    const [status, setStatus] = useState("Ready to Fight?");
    const [inGame, setInGame] = useState(false);

    // Game State
    const [roomId, setRoomId] = useState(null);
    const [timeLeft, setTimeLeft] = useState(15);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [myScore, setMyScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [opponentName, setOpponentName] = useState("Opponent");
    const [opponentSchool, setOpponentSchool] = useState("Unknown");
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [locked, setLocked] = useState(false);
    const [finalResults, setFinalResults] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            auth: { token }
        });

        socket.on('connect', () => {
            console.log("Connected to Battle Server");
        });

        socket.on('match_found', (data) => {
            setSearching(false);
            setRoomId(data.roomId);
            setStatus("Enemy Found! Entering Arena...");

            // Parse Opponent
            const oppData = Object.values(data.opponent).find(p => p.name !== user.name);
            if (oppData) {
                setOpponentName(oppData.name);
                setOpponentSchool(oppData.school);
            }

            setTimeout(() => {
                setInGame(true);
            }, 1500);
        });

        socket.on('new_question', (data) => {
            setCurrentQuestion(data);
            setTimeLeft(15);
            setLocked(false);
        });

        socket.on('question_timeout', () => {
            setLocked(true);
        });

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

        socket.on('opponent_disconnected', () => {
            alert("Opponent Disconnected! You Win!");
            setGameOver(true);
            setWinner('You');
            setMyScore(prev => prev + 100); // Bonus
            confetti();
        });

        return () => {
            socket.disconnect();
        };
    }, [user?.name]);

    // Timer Effect
    useEffect(() => {
        if (inGame && timeLeft > 0 && !locked && currentQuestion && !gameOver) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft, locked, currentQuestion, inGame, gameOver]);

    const handleFindMatch = () => {
        setSearching(true);
        setStatus("Searching for opponent...");
        socket.emit('find_match');
    };

    const handleAnswer = (index) => {
        if (locked) return;
        setLocked(true);

        socket.emit('submit_answer', {
            roomId,
            answerIndex: index,
            timeRemaining: timeLeft
        });
        // Optimistic score update could go here
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
                        onClick={() => window.location.reload()} // Reload to reset socket cleanly
                        className="mt-8 px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-gray-200"
                    >
                        Play Again
                    </button>
                </motion.div>
            </div>
        );
    }

    if (inGame) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col pt-8 px-4">
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
                        <p className="text-3xl font-black text-white mt-2">???</p>
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
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-10 max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl"
            >
                <div className="mb-8 relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Swords className="w-12 h-12 text-white" />
                    </div>
                    {searching && (
                        <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-purple-400/50 rounded-full animate-ping"></div>
                    )}
                </div>

                <h1 className="text-3xl font-black italic text-white mb-2 uppercase tracking-wider">Battle Arena</h1>
                <p className="text-purple-300 font-medium mb-8">Class {user?.class} Division</p>

                <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <User size={20} className="text-blue-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-gray-400 uppercase">You</p>
                                <p className="text-white font-bold">{user?.name}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase">School Controller</p>
                            <p className="text-emerald-400 font-bold">{user?.school?.name || "No School"}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Shield size={14} /> Fair Play Enabled
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Zap size={14} /> AI Questions
                        </div>
                    </div>
                </div>

                {!searching ? (
                    <button
                        onClick={handleFindMatch}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-purple-600/30 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <Search className="w-6 h-6" />
                        FIND MATCH
                    </button>
                ) : (
                    <div className="w-full py-4 bg-white/5 border border-white/10 text-white font-medium rounded-2xl flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        {status}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default BattleLobby;
