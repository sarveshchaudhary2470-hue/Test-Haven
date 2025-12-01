import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, Award, TrendingUp, BookOpen } from 'lucide-react';
import axios from 'axios';
import toast from '../utils/toast';

const AnalyticsDashboard = ({ testId }) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        questionPerformance: [],
        classComparison: [],
        topPerformers: [],
        overview: null
    });

    useEffect(() => {
        if (testId) {
            fetchAnalytics();
        }
    }, [testId]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [questionsRes, classRes, topRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/analytics/test/${testId}/questions`, { headers }),
                axios.get(`http://localhost:5000/api/analytics/test/${testId}/class-comparison`, { headers }),
                axios.get(`http://localhost:5000/api/analytics/test/${testId}/top-performers`, { headers })
            ]);

            setStats({
                questionPerformance: questionsRes.data,
                classComparison: classRes.data,
                topPerformers: topRes.data,
                overview: calculateOverview(questionsRes.data, classRes.data)
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const calculateOverview = (questions, classes) => {
        const totalAttempts = questions[0]?.totalAttempts || 0;
        const avgScore = classes.reduce((acc, curr) => acc + parseFloat(curr.averagePercentage), 0) / (classes.length || 1);

        return {
            totalAttempts,
            averageScore: avgScore.toFixed(1),
            totalQuestions: questions.length,
            participatingClasses: classes.length
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500/20 border-t-primary-500"></div>
            </div>
        );
    }

    const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

    return (
        <div className="space-y-6 p-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Users}
                    label="Total Attempts"
                    value={stats.overview?.totalAttempts}
                    color="blue"
                />
                <StatCard
                    icon={Award}
                    label="Average Score"
                    value={`${stats.overview?.averageScore}%`}
                    color="green"
                />
                <StatCard
                    icon={BookOpen}
                    label="Total Questions"
                    value={stats.overview?.totalQuestions}
                    color="purple"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Classes"
                    value={stats.overview?.participatingClasses}
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Class Comparison Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                    <h3 className="text-lg font-bold text-white mb-6">Class Performance Comparison</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.classComparison}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="class" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Bar dataKey="averagePercentage" name="Avg Score %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="passPercentage" name="Pass Rate %" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Top Performers */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                    <h3 className="text-lg font-bold text-white mb-6">Top Performers</h3>
                    <div className="overflow-y-auto h-80 custom-scrollbar">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-[#1e293b] z-10">
                                <tr className="text-left text-sm text-gray-400 border-b border-white/10">
                                    <th className="pb-3 pl-2">Rank</th>
                                    <th className="pb-3">Student</th>
                                    <th className="pb-3">Class</th>
                                    <th className="pb-3 text-right pr-2">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stats.topPerformers.map((student, index) => (
                                    <tr key={index} className="text-sm hover:bg-white/5 transition-colors">
                                        <td className="py-3 pl-2">
                                            <span className={`
                                                inline-flex items-center justify-center w-6 h-6 rounded-full font-bold
                                                ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                                    index === 1 ? 'bg-gray-400/20 text-gray-400' :
                                                        index === 2 ? 'bg-orange-500/20 text-orange-500' : 'text-gray-500'}
                                            `}>
                                                {student.rank}
                                            </span>
                                        </td>
                                        <td className="py-3 text-white font-medium">{student.studentName}</td>
                                        <td className="py-3 text-gray-400">{student.studentClass}</td>
                                        <td className="py-3 text-right pr-2">
                                            <div className="font-bold text-white">{student.percentage}%</div>
                                            <div className="text-xs text-gray-500">{student.timeTaken}s</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* Question Performance Analysis */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
                <h3 className="text-lg font-bold text-white mb-6">Question-wise Analysis</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.questionPerformance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="questionNumber" stroke="#9ca3af" label={{ value: 'Question #', position: 'insideBottom', offset: -5 }} />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="successRate" name="Success Rate %" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="averageTime" name="Avg Time (s)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
    const colors = {
        blue: 'bg-blue-500/10 text-blue-500',
        green: 'bg-green-500/10 text-green-500',
        purple: 'bg-purple-500/10 text-purple-500',
        orange: 'bg-orange-500/10 text-orange-500'
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${colors[color]}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm text-gray-400">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
