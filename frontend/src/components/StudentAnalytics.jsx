import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { TrendingUp, Award, CheckCircle, Clock, BookOpen } from 'lucide-react';

const StudentAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/analytics/student/dashboard-stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="text-white text-center py-8">Loading Analytics...</div>;
    if (!stats) return null;

    return (
        <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Tests</p>
                            <h3 className="text-2xl font-bold text-white">{stats.totalTests}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Avg Score</p>
                            <h3 className="text-2xl font-bold text-white">{stats.averagePercentage}%</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Tests Passed</p>
                            <h3 className="text-2xl font-bold text-white">{stats.testsPassed}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Study Hours</p>
                            <h3 className="text-2xl font-bold text-white">{(stats.totalTimeSpent / 60).toFixed(1)}h</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Performance Trend */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Performance Trend</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.recentActivity}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis
                                    dataKey="testName"
                                    stroke="#9ca3af"
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    tickFormatter={(val) => val.length > 10 ? val.substr(0, 10) + '...' : val}
                                />
                                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="percentage"
                                    stroke="#8b5cf6"
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subject Wise Performance */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Subject Strength</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.subjectPerformance} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                                <XAxis type="number" stroke="#9ca3af" domain={[0, 100]} />
                                <YAxis
                                    dataKey="subject"
                                    type="category"
                                    width={80}
                                    stroke="#9ca3af"
                                    tick={{ fill: '#9ca3af' }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#ffffff10' }}
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                />
                                <Bar dataKey="average" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentAnalytics;
