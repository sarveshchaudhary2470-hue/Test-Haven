import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Shield, Zap, Lock, Unlock, Trophy, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminBattleControl = () => {
    const { user } = useAuth();
    const [schools, setSchools] = useState([]);
    const [activeEvent, setActiveEvent] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [revealTriggered, setRevealTriggered] = useState(false);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [schoolsRes, eventRes] = await Promise.all([
                axios.get('/api/admin/schools', { headers: { Authorization: `Bearer ${token}` } }),
                // Assuming an endpoint to get current battle state exists or we use local state simulation for now
                // For MVP, we might toggle local state if backend endpoint isn't full ready, but let's assume we fetch school status
                Promise.resolve({ data: null })
            ]);
            setSchools(schoolsRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching battle data:", error);
            setLoading(false);
        }
    };

    const toggleBattleAccess = async (schoolId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/schools/${schoolId}`,
                { isBattleEnabled: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Optimistic update
            setSchools(schools.map(s => s._id === schoolId ? { ...s, isBattleEnabled: !currentStatus } : s));
        } catch (error) {
            alert("Failed to toggle access");
        }
    };

    const startBattleEvent = () => {
        // In a real scenario, this would call an API to open the WebSocket 'gate' global time
        // For now, we just visually show it as 'Active'
        setActiveEvent({ status: 'LIVE', startTime: new Date() });
    };

    const stopBattleEvent = () => {
        if (window.confirm("Stop all battles? This will disconnect players.")) {
            setActiveEvent(null);
            // API call to kill switch
        }
    };

    // Mock Result Generation for Reveal
    const generateMockResults = () => {
        // Fetch real results in prod
        setResults({
            winner: schools[0],
            topStudents: [
                { name: "Rahul", score: 2500, school: schools[0]?.name },
                { name: "Priya", score: 2450, school: schools[1]?.name },
                { name: "Amit", score: 2300, school: schools[0]?.name }
            ]
        });
    };

    return (
        <div className="p-6 text-white min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/20">
                        <Swords className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Battle Arena Control</h1>
                        <p className="text-gray-400">Manage School Wars Events</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    {!activeEvent ? (
                        <button
                            onClick={startBattleEvent}
                            className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-bold flex items-center gap-2 transition-transform active:scale-95"
                        >
                            <Zap size={20} /> LAUNCH EVENT
                        </button>
                    ) : (
                        <button
                            onClick={stopBattleEvent}
                            className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-bold flex items-center gap-2 animate-pulse"
                        >
                            <AlertTriangle size={20} /> EMERGENCY STOP
                        </button>
                    )}
                </div>
            </div>

            {/* Live Status */}
            {activeEvent && (
                <div className="mb-8 bg-green-500/10 border border-green-500/30 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                        <h2 className="text-xl font-bold text-green-400">BATTLE EVENT LIVE</h2>
                    </div>
                    <div className="relative z-10 font-mono text-2xl font-bold">
                        00:45:00
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* School Access Control */}
                <div className="lg:col-span-2">
                    <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Shield className="text-blue-400" /> School Access Whitelist
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {schools.map(school => (
                                <div key={school._id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div>
                                        <h4 className="font-bold">{school.name}</h4>
                                        <p className="text-xs text-gray-400">Code: {school.code}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleBattleAccess(school._id, school.isBattleEnabled)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${school.isBattleEnabled
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            }`}
                                    >
                                        {school.isBattleEnabled ? <Unlock size={14} /> : <Lock size={14} />}
                                        {school.isBattleEnabled ? 'ENABLED' : 'LOCKED'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results & Reveal */}
                <div className="space-y-6">
                    <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Trophy className="text-yellow-400" /> Grand Reveal
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Manually trigger the winner announcement animation for all connected clients.
                        </p>

                        {!results ? (
                            <button
                                onClick={generateMockResults}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={18} /> GENERATE RESULTS
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-center">
                                    <p className="text-xs text-yellow-500 uppercase font-bold">Projected Winner</p>
                                    <h2 className="text-2xl font-black text-white">{results.winner?.name || "None"}</h2>
                                </div>
                                <button
                                    onClick={() => setRevealTriggered(true)}
                                    className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-xl shadow-lg shadow-yellow-500/20 animate-pulse text-lg"
                                >
                                    📢 BROADCAST WINNER
                                </button>
                                {revealTriggered && <p className="text-center text-green-400 text-sm font-bold">Broadcasting Reveal...</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBattleControl;
