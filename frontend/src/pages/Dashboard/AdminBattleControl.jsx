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

    const [battleForm, setBattleForm] = useState({
        title: 'School Wars : Season 1',
        message: 'The Arena Awaits...',
        startTime: '',
        endTime: ''
    });

    const [selectedWinner, setSelectedWinner] = useState('');
    const [isEditingWinner, setIsEditingWinner] = useState(false);
    const [showControls, setShowControls] = useState(false);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (schools.length > 0 && !results && !loading) {
            // Simulate automatic winner calculation if not present
            generateMockResults();
        }
    }, [schools, loading, results]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [schoolsRes, eventRes] = await Promise.all([
                axios.get('/api/admin/schools', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/admin/battle-event', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setSchools(schoolsRes.data);
            setActiveEvent(eventRes.data);

            if (eventRes.data) {
                if (!activeEvent) {
                    // Pre-fill form only on first load/if empty
                    setBattleForm(prev => ({
                        ...prev,
                        title: eventRes.data.title,
                        message: eventRes.data.message,
                        startTime: eventRes.data.startTime ? new Date(eventRes.data.startTime).toISOString().slice(0, 16) : '',
                        endTime: eventRes.data.endTime ? new Date(eventRes.data.endTime).toISOString().slice(0, 16) : ''
                    }));
                }

                // Persist winner state
                if (eventRes.data.winnerSchoolNameOverride) {
                    setResults({ winner: { name: eventRes.data.winnerSchoolNameOverride } });
                    setSelectedWinner(eventRes.data.winnerSchoolNameOverride);
                }
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching battle data:", error);
            setLoading(false);
        }
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            // Include current selected winner in the update so it doesn't get wiped
            await axios.post('/api/admin/battle-event', {
                ...battleForm,
                winnerSchoolNameOverride: selectedWinner
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("✅ Battle Configured & Scheduled!");
            fetchData();
        } catch (error) {
            console.error(error);
            alert("Failed to schedule battle");
        }
    };

    const handleWinnerUpdate = async (name) => {
        setSelectedWinner(name);
        setResults({ winner: { name } });
        try {
            const token = localStorage.getItem('token');
            // Update just the winner (merged with existing form data to be safe, or backend handles partials? 
            // Backend replaces whole object if we use the POST route as implemented. 
            // So we must send everything.
            await axios.post('/api/admin/battle-event', {
                ...battleForm,
                winnerSchoolNameOverride: name
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Failed to save winner", error);
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

    const stopBattleEvent = () => {
        if (window.confirm("Stop all battles? This will disconnect players.")) {
            // Logic to kill would go here (update status to ended via API)
            // For now just alert
            alert("Emergency Stop Triggered");
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
                    {/* Status Indicator */}
                    <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-mono font-bold ${activeEvent?.status === 'scheduled' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : activeEvent?.isActive ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-gray-500/10 border-gray-500/30 text-gray-500'}`}>
                        {activeEvent?.status === 'scheduled' ? '⏳ SCHEDULED' : activeEvent?.isActive ? '⚡ LIVE' : '🔴 OFFLINE'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Configuration */}
                <div className="space-y-8">
                    <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Zap className="text-purple-400" /> Event Configuration
                        </h3>
                        <form onSubmit={handleScheduleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Event Title</label>
                                <input
                                    type="text"
                                    required
                                    value={battleForm.title}
                                    onChange={e => setBattleForm({ ...battleForm, title: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Countdown Message</label>
                                <input
                                    type="text"
                                    value={battleForm.message}
                                    onChange={e => setBattleForm({ ...battleForm, message: e.target.value })}
                                    placeholder="e.g. Arena opens in 10 mins..."
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={battleForm.startTime}
                                        onChange={e => setBattleForm({ ...battleForm, startTime: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">End Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={battleForm.endTime}
                                        onChange={e => setBattleForm({ ...battleForm, endTime: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20 mt-2">
                                Save Schedule Configuration
                            </button>
                        </form>
                    </div>

                    {/* Results & Reveal - Moved here */}
                    <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Trophy className="text-yellow-400" /> Grand Reveal
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Manually trigger the winner announcement animation for all connected clients.
                        </p>

                        <div className="space-y-4">

                            <div
                                className={`p-4 border rounded-xl relative group transition-all duration-500 ${showControls ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-[#1e293b]/50 border-white/5 cursor-default'}`}
                                onDoubleClick={() => setShowControls(true)}
                                title={!showControls ? "Double click to manage winner" : ""}
                            >
                                <p className={`text-xs uppercase font-bold text-center mb-2 transition-colors ${showControls ? 'text-yellow-500' : 'text-gray-500'}`}>
                                    {showControls ? "Winner Control (Admin)" : "Projected Result"}
                                </p>

                                {isEditingWinner ? (
                                    <select
                                        autoFocus
                                        value={selectedWinner}
                                        onChange={(e) => {
                                            handleWinnerUpdate(e.target.value);
                                            setIsEditingWinner(false);
                                        }}
                                        onBlur={() => setIsEditingWinner(false)}
                                        className="w-full bg-black/40 border border-yellow-500/30 rounded-lg px-4 py-2 text-white font-bold text-center focus:outline-none focus:border-yellow-500"
                                    >
                                        {schools.map(school => (
                                            <option key={school._id} value={school.name} className="bg-[#1e293b]">
                                                {school.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <h2
                                        onClick={() => showControls && setIsEditingWinner(true)}
                                        className={`text-2xl font-black text-center transition-colors ${showControls ? 'text-white cursor-pointer hover:text-yellow-200' : 'text-gray-400'}`}
                                    >
                                        {selectedWinner || results?.winner?.name || "Pending..."}
                                    </h2>
                                )}

                                {showControls && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowControls(false); }}
                                        className="absolute top-2 right-2 text-gray-500 hover:text-white"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            <AnimatePresence>
                                {showControls && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                        <button
                                            onClick={() => setRevealTriggered(true)}
                                            disabled={!selectedWinner && !results?.winner}
                                            className={`w-full py-4 rounded-xl font-bold shadow-lg shadow-yellow-500/20 text-lg transition-all
                                                ${(selectedWinner || results?.winner)
                                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black animate-pulse cursor-pointer'
                                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'}`}
                                        >
                                            📢 BROADCAST WINNER
                                        </button>
                                        {revealTriggered && <p className="text-center text-green-400 text-sm font-bold mt-2">Broadcasting Reveal...</p>}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Right Column: School Access (Spans 2 cols on large screens) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Live Banner if Active */}
                    {activeEvent && activeEvent.isActive && (
                        <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden">
                            <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                                <div>
                                    <h2 className="text-xl font-bold text-green-400">{activeEvent.title} IS LIVE</h2>
                                    <p className="text-green-300/80 text-sm">{activeEvent.message}</p>
                                </div>
                            </div>
                            <div className="relative z-10 font-mono text-2xl font-bold">
                                {new Date(activeEvent.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Ends
                            </div>
                        </div>
                    )}

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
            </div>
        </div>
    );
};

export default AdminBattleControl;
