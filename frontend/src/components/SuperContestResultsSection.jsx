import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Trophy, Medal, Clock, Target, User, ChevronDown, ChevronUp } from 'lucide-react';

const SuperContestResultsSection = () => {
    const [contests, setContests] = useState([]);
    const [expandedContest, setExpandedContest] = useState(null);
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        try {
            const response = await axios.get('/api/super-contests');
            const contestData = response.data.data || [];
            setContests(contestData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching contests:', error);
            setLoading(false);
        }
    };

    const fetchResults = async (contestId) => {
        if (results[contestId]) {
            return; // Already fetched
        }

        try {
            const response = await axios.get(`/api/super-contests/${contestId}/results`);
            setResults(prev => ({
                ...prev,
                [contestId]: response.data.data || []
            }));
        } catch (error) {
            console.error('Error fetching results:', error);
        }
    };

    const handleToggleContest = async (contestId) => {
        if (expandedContest === contestId) {
            setExpandedContest(null);
        } else {
            setExpandedContest(contestId);
            await fetchResults(contestId);
        }
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <span className="text-2xl">🥇</span>;
        if (rank === 2) return <span className="text-2xl">🥈</span>;
        if (rank === 3) return <span className="text-2xl">🥉</span>;
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    };

    const getRankBadgeClass = (rank) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
        if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
        if (rank === 3) return 'bg-gradient-to-r from-orange-600 to-orange-700 text-white';
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl">
                    <Trophy className="h-8 w-8 text-yellow-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        Contest Results & Leaderboards
                    </h2>
                    <p className="text-gray-400 text-sm">View all super contest results and rankings</p>
                </div>
            </div>

            {contests.length === 0 ? (
                <div className="text-center py-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
                    <Trophy className="h-20 w-20 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No contests yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {contests.map((contest) => {
                        const isExpanded = expandedContest === contest._id;
                        const contestResults = results[contest._id] || [];

                        return (
                            <motion.div
                                key={contest._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
                            >
                                {/* Contest Header */}
                                <button
                                    onClick={() => handleToggleContest(contest._id)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl">
                                            <Trophy className="h-6 w-6 text-yellow-400" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-bold text-white">{contest.title}</h3>
                                            <p className="text-sm text-gray-400">{contest.subject} • {contest.participantCount || 0} participants</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-semibold">
                                            {new Date(contest.startTime).toLocaleDateString()}
                                        </span>
                                        {isExpanded ? (
                                            <ChevronUp className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-gray-400" />
                                        )}
                                    </div>
                                </button>

                                {/* Results Table */}
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-white/10"
                                    >
                                        {contestResults.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Medal className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                                <p className="text-gray-400">No submissions yet</p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-white/5">
                                                        <tr>
                                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Rank</th>
                                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Student</th>
                                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Class</th>
                                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Score</th>
                                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Percentage</th>
                                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Time Taken</th>
                                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Submitted</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {contestResults.map((result, index) => (
                                                            <motion.tr
                                                                key={result._id}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.05 }}
                                                                className={`hover:bg-white/5 transition-colors ${result.rank <= 3 ? 'bg-white/5' : ''
                                                                    }`}
                                                            >
                                                                <td className="px-6 py-4">
                                                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${getRankBadgeClass(result.rank)}`}>
                                                                        {getRankIcon(result.rank)}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                                                                            <User className="h-5 w-5 text-primary-400" />
                                                                        </div>
                                                                        <span className="font-medium text-white">{result.student?.name || 'Unknown'}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-gray-300">
                                                                    Class {result.student?.class || 'N/A'}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="text-lg font-bold text-white">{result.score}</span>
                                                                    <span className="text-gray-400">/{contest.totalMarks}</span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${result.percentage >= 75
                                                                            ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                                                                            : result.percentage >= 50
                                                                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                                                                                : 'bg-red-500/20 text-red-300 border border-red-500/40'
                                                                        }`}>
                                                                        {result.percentage.toFixed(1)}%
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-2 text-gray-300">
                                                                        <Clock className="h-4 w-4 text-blue-400" />
                                                                        <span className="font-mono text-sm">{result.timeDisplay}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-400">
                                                                    {new Date(result.submittedAt).toLocaleString()}
                                                                </td>
                                                            </motion.tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SuperContestResultsSection;
