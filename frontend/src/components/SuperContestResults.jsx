import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Clock, Target, User, Download, X } from 'lucide-react';

const SuperContestResults = ({ contestId, onClose }) => {
    const [results, setResults] = useState([]);
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResults();
    }, [contestId]);

    const fetchResults = async () => {
        try {
            const [resultsRes, contestRes] = await Promise.all([
                axios.get(`/api/super-contests/${contestId}/results`),
                axios.get(`/api/super-contests/${contestId}`)
            ]);

            setResults(resultsRes.data.data || []);
            setContest(contestRes.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching results:', error);
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <span className="text-3xl">🥇</span>;
        if (rank === 2) return <span className="text-3xl">🥈</span>;
        if (rank === 3) return <span className="text-3xl">🥉</span>;
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    };

    const getRankBadgeClass = (rank) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/50';
        if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-500/50';
        if (rank === 3) return 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-500/50';
        return 'bg-white/5 border border-white/10 text-gray-300';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl">
                            <Trophy className="h-8 w-8 text-yellow-400" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white">{contest?.title}</h2>
                            <p className="text-gray-400">Leaderboard - {results.length} Participants</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="h-6 w-6 text-gray-400" />
                    </button>
                </div>

                {/* Top 3 Podium */}
                {results.length >= 3 && (
                    <div className="flex items-end justify-center gap-4 mb-12">
                        {/* 2nd Place */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-gray-500/50">
                                <span className="text-4xl">🥈</span>
                            </div>
                            <div className="bg-gradient-to-br from-gray-400/20 to-gray-500/20 border border-gray-400/40 rounded-2xl p-4 w-48 text-center">
                                <p className="font-bold text-white text-lg mb-1">{results[1].student.name}</p>
                                <p className="text-sm text-gray-400 mb-2">Class {results[1].student.class}</p>
                                <p className="text-2xl font-bold text-white mb-1">{results[1].score}/{contest.totalMarks}</p>
                                <p className="text-xs text-gray-400">{results[1].timeDisplay}</p>
                            </div>
                            <div className="w-48 h-32 bg-gradient-to-t from-gray-500/30 to-gray-400/20 rounded-t-2xl mt-2 flex items-center justify-center">
                                <span className="text-6xl font-bold text-gray-400">2</span>
                            </div>
                        </motion.div>

                        {/* 1st Place */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="flex flex-col items-center -mt-8"
                        >
                            <div className="w-32 h-32 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-3 shadow-2xl shadow-yellow-500/50 animate-pulse">
                                <span className="text-5xl">👑</span>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/60 rounded-2xl p-6 w-56 text-center">
                                <p className="font-bold text-white text-xl mb-1">{results[0].student.name}</p>
                                <p className="text-sm text-gray-400 mb-3">Class {results[0].student.class}</p>
                                <p className="text-3xl font-bold text-yellow-400 mb-2">{results[0].score}/{contest.totalMarks}</p>
                                <p className="text-sm text-gray-300">{results[0].timeDisplay}</p>
                            </div>
                            <div className="w-56 h-40 bg-gradient-to-t from-yellow-500/30 to-orange-400/20 rounded-t-2xl mt-2 flex items-center justify-center">
                                <span className="text-7xl font-bold text-yellow-400">1</span>
                            </div>
                        </motion.div>

                        {/* 3rd Place */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-24 h-24 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-orange-500/50">
                                <span className="text-4xl">🥉</span>
                            </div>
                            <div className="bg-gradient-to-br from-orange-600/20 to-orange-700/20 border border-orange-500/40 rounded-2xl p-4 w-48 text-center">
                                <p className="font-bold text-white text-lg mb-1">{results[2].student.name}</p>
                                <p className="text-sm text-gray-400 mb-2">Class {results[2].student.class}</p>
                                <p className="text-2xl font-bold text-white mb-1">{results[2].score}/{contest.totalMarks}</p>
                                <p className="text-xs text-gray-400">{results[2].timeDisplay}</p>
                            </div>
                            <div className="w-48 h-24 bg-gradient-to-t from-orange-600/30 to-orange-500/20 rounded-t-2xl mt-2 flex items-center justify-center">
                                <span className="text-6xl font-bold text-orange-400">3</span>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Full Leaderboard Table */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Rank</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Class</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Percentage</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Time Taken</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Submitted At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {results.map((result, index) => (
                                    <motion.tr
                                        key={result._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`hover:bg-white/5 transition-colors ${result.rank <= 3 ? 'bg-white/5' : ''
                                            }`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${getRankBadgeClass(result.rank)}`}>
                                                {getRankIcon(result.rank)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                                                    <User className="h-5 w-5 text-primary-400" />
                                                </div>
                                                <span className="font-medium text-white">{result.student.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                            Class {result.student.class}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-lg font-bold text-white">{result.score}</span>
                                            <span className="text-gray-400">/{contest.totalMarks}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${result.percentage >= 75
                                                    ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                                                    : result.percentage >= 50
                                                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                                                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                                                }`}>
                                                {result.percentage.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Clock className="h-4 w-4 text-blue-400" />
                                                <span className="font-mono text-sm">{result.timeDisplay}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            {new Date(result.submittedAt).toLocaleString()}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {results.length === 0 && (
                    <div className="text-center py-12">
                        <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No submissions yet</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default SuperContestResults;
