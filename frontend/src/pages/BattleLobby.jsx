import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, User, Shield, Zap, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

let socket;

const BattleLobby = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searching, setSearching] = useState(false);
    const [status, setStatus] = useState("Ready to Fight?");

    useEffect(() => {
        // Initialize Socket
        const token = localStorage.getItem('token');
        socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            auth: { token }
        });

        socket.on('connect', () => {
            console.log("Connected to Battle Server");
        });

        socket.on('match_found', (data) => {
            setSearching(false);
            setStatus("Enemy Found! Entering Arena...");
            setTimeout(() => {
                navigate(`/battle/${data.roomId}`, { state: { opponent: data.opponent, roomId: data.roomId } });
            }, 1500);
        });

        return () => {
            socket.disconnect();
        };
    }, [navigate]);

    const handleFindMatch = () => {
        setSearching(true);
        setStatus("Searching for opponent...");
        socket.emit('find_match');
    };

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
