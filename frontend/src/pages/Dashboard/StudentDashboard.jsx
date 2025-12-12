import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Clock, CheckCircle, Award, User, GraduationCap, TrendingUp, Calendar,
    BookOpen, Download, Bell, ChevronRight, Star, Target, Zap, BookMarked, FileCheck, Trophy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import ResultDetailsModal from '../../components/ResultDetailsModal';
import StudentAnalytics from '../../components/StudentAnalytics';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [results, setResults] = useState([]);
    const [studyMaterials, setStudyMaterials] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showAllMaterials, setShowAllMaterials] = useState(false);
    const [showAllNotifications, setShowAllNotifications] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [superContests, setSuperContests] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [testsRes, resultsRes, materialsRes, notificationsRes, contestsRes] = await Promise.all([
                axios.get('/api/tests'),
                axios.get('/api/results/my-results'),
                axios.get('/api/study-materials'),
                axios.get('/api/notifications'),
                axios.get('/api/super-contests')
            ]);

            setTests(testsRes.data);
            setResults(resultsRes.data);
            setStudyMaterials(materialsRes.data);
            setNotifications(notificationsRes.data);
            setSuperContests(contestsRes.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const completedTestIds = new Set(results.filter(r => r.test).map(r => r.test._id));
    const availableTests = tests.filter(t => !completedTestIds.has(t._id));

    const stats = {
        available: availableTests.length,
        completed: results.length,
        avgScore: results.length > 0
            ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(1)
            : 0,
        materials: studyMaterials.length,
        notifications: notifications.filter(n => !n.isRead).length
    };

    const handleViewResult = async (resultId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/results/test/${resultId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedResult(response.data);
            setShowResultModal(true);
        } catch (error) {
            console.error('Error fetching result details:', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            const token = localStorage.getItem('token');
            // Mark notification as read
            if (!notification.isRead) {
                await axios.put(`/api/notifications/${notification._id}/read`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Refresh notifications
                fetchData();
            }

            // Navigate based on notification type
            if (notification.type === 'test' && notification.link) {
                navigate(notification.link);
            } else if (notification.type === 'result' && notification.link) {
                navigate(notification.link);
            }
        } catch (error) {
            console.error('Error handling notification:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="relative">
                        <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary-500/20 border-t-primary-500 mx-auto mb-6"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <GraduationCap className="h-8 w-8 text-primary-400" />
                        </div>
                    </div>
                    <p className="text-gray-300 text-lg font-medium">Loading your dashboard...</p>
                    <p className="text-gray-500 text-sm mt-2">Please wait</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900 pt-16">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Profile Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="relative bg-gradient-to-r from-primary-600/20 via-secondary-600/20 to-accent-600/20 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 overflow-hidden shadow-2xl">
                        {/* Animated gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-secondary-500/5 animate-pulse"></div>

                        {/* Decorative elements */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary-500/20 rounded-full blur-3xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                {/* Avatar with glow effect */}
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative w-28 h-28 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform">
                                        <User className="h-14 w-14 text-white" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-lg">
                                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                                    </div>
                                </div>

                                {/* User Info */}
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-3">
                                        Welcome, {user?.name}! 👋
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/15 transition-colors">
                                            <GraduationCap className="h-5 w-5 text-primary-400" />
                                            <span className="text-sm font-semibold text-white">Class {user?.class}</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                                            <Calendar className="h-5 w-5 text-secondary-400" />
                                            <span className="text-sm text-gray-300">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-full border border-green-500/30">
                                            <Zap className="h-5 w-5 text-green-400" />
                                            <span className="text-sm font-semibold text-green-300">Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            {stats.completed > 0 && (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl border border-green-500/30 shadow-xl"
                                >
                                    <div className="p-3 bg-green-500/20 rounded-xl">
                                        <TrendingUp className="h-6 w-6 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-green-300 font-medium uppercase tracking-wide">Avg Score</p>
                                        <p className="text-3xl font-bold text-white">{stats.avgScore}%</p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-2 rounded-xl font-medium transition-all ${activeTab === 'overview' ? 'bg-primary-500/20 text-primary-300 border border-primary-500/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-6 py-2 rounded-xl font-medium transition-all ${activeTab === 'analytics' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Performance Analytics
                    </button>
                </div>

                {activeTab === 'analytics' ? (
                    <StudentAnalytics />
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                            {[
                                { label: 'Available Tests', value: stats.available, icon: Clock, color: 'from-blue-500 to-cyan-500', bgColor: 'from-blue-500/20 to-cyan-500/20' },
                                { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'from-green-500 to-emerald-500', bgColor: 'from-green-500/20 to-emerald-500/20' },
                                { label: 'Average Score', value: `${stats.avgScore}%`, icon: Award, color: 'from-purple-500 to-pink-500', bgColor: 'from-purple-500/20 to-pink-500/20' },
                                { label: 'Study Materials', value: stats.materials, icon: BookOpen, color: 'from-orange-500 to-red-500', bgColor: 'from-orange-500/20 to-red-500/20' },
                                { label: 'Notifications', value: stats.notifications, icon: Bell, color: 'from-yellow-500 to-amber-500', bgColor: 'from-yellow-500/20 to-amber-500/20' }
                            ].map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                                >
                                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`p-3 bg-gradient-to-br ${stat.bgColor} rounded-xl group-hover:scale-110 transition-transform`}>
                                            <stat.icon className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">{stat.label}</p>
                                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column - Tests & Results */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Available Tests */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-br from-primary-500/20 to-blue-500/20 rounded-xl">
                                                <FileText className="h-6 w-6 text-primary-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-white">Available Tests</h2>
                                                <p className="text-gray-400 text-sm">Start your assessments</p>
                                            </div>
                                        </div>
                                        {availableTests.length > 0 && (
                                            <div className="px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full">
                                                <span className="text-primary-300 font-semibold text-sm">{availableTests.length} Test{availableTests.length !== 1 ? 's' : ''}</span>
                                            </div>
                                        )}
                                    </div>

                                    {availableTests.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800/50 rounded-full mb-4">
                                                <FileCheck className="h-10 w-10 text-gray-600" />
                                            </div>
                                            <p className="text-gray-400 text-lg font-medium">All caught up!</p>
                                            <p className="text-gray-500 text-sm mt-2">No pending tests at the moment</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {availableTests.slice(0, 4).map((test, index) => (
                                                <motion.div
                                                    key={test._id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-5 hover:border-primary-500/40 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300"
                                                >
                                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-blue-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="p-2 bg-gradient-to-br from-primary-500/20 to-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                                                            <Target className="h-5 w-5 text-primary-400" />
                                                        </div>
                                                        <span className="px-2 py-1 bg-primary-500/10 text-primary-300 text-xs font-semibold rounded-full border border-primary-500/30">
                                                            Class {test.class}
                                                        </span>
                                                    </div>

                                                    <h3 className="font-bold text-lg text-white mb-1 group-hover:text-primary-300 transition-colors line-clamp-1">{test.title}</h3>
                                                    <p className="text-gray-400 text-sm mb-4">{test.subject}</p>

                                                    <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                                                            <span>{test.questions.length} Questions</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{test.duration} mins</span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => navigate(`/test/${test._id}`)}
                                                        className="w-full bg-gradient-to-r from-primary-500 to-blue-500 hover:from-primary-600 hover:to-blue-600 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-primary-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 flex items-center justify-center gap-2"
                                                    >
                                                        Start Test
                                                        <ChevronRight className="h-4 w-4" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>

                                {/* Battle Arena Entry Card (Conditional) */}
                                {user?.school?.isBattleEnabled && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="mb-8 relative overflow-hidden rounded-3xl p-1 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-2xl cursor-pointer group"
                                        onClick={() => navigate('/battle')}
                                    >
                                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>

                                        <div className="relative bg-black/40 backdrop-blur-md rounded-[20px] p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white/10 rounded-2xl border border-white/20 group-hover:scale-110 transition-transform">
                                                    <Trophy className="w-8 h-8 text-yellow-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black italic text-white uppercase tracking-wider group-hover:text-yellow-400 transition-colors">
                                                        Battle Arena
                                                    </h3>
                                                    <p className="text-purple-200 font-medium">Fight for your School's Glory!</p>
                                                </div>
                                            </div>

                                            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 group-hover:bg-white/20 transition-colors">
                                                <span className="text-white font-bold">ENTER NOW</span>
                                                <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Super Contests */}
                                {superContests.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border border-yellow-500/30 rounded-3xl p-6 shadow-2xl"
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                                                <Trophy className="h-7 w-7 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                                                    🏆 Super Contests
                                                </h2>
                                                <p className="text-gray-400 text-sm">Compete and win!</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {superContests.map((contest, index) => {
                                                const now = new Date();
                                                const start = new Date(contest.startTime);
                                                const end = new Date(contest.endTime);
                                                const isLive = now >= start && now <= end;
                                                const isUpcoming = now < start;

                                                return (
                                                    <motion.div
                                                        key={contest._id}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="relative bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-5 hover:border-yellow-500/50 hover:shadow-xl hover:shadow-yellow-500/20 transition-all group"
                                                    >
                                                        {/* Status Badge */}
                                                        <div className="absolute -top-2 -right-2">
                                                            {isLive ? (
                                                                <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                                                                    🔴 LIVE
                                                                </span>
                                                            ) : isUpcoming ? (
                                                                <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-full shadow-lg">
                                                                    UPCOMING
                                                                </span>
                                                            ) : (
                                                                <span className="px-3 py-1 bg-gray-500/50 text-gray-300 text-xs font-bold rounded-full">
                                                                    ENDED
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Trophy Icon */}
                                                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                            <Trophy className="h-6 w-6 text-white" />
                                                        </div>

                                                        {/* Title */}
                                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                                                            {contest.title}
                                                        </h3>

                                                        {/* Subject */}
                                                        <p className="text-gray-400 text-sm mb-3">{contest.subject}</p>

                                                        {/* Info */}
                                                        <div className="space-y-2 mb-4">
                                                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                                                <Clock className="h-4 w-4 text-blue-400" />
                                                                <span>{contest.duration} minutes</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                                                <Target className="h-4 w-4 text-purple-400" />
                                                                <span>{contest.totalMarks} marks</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                                                <User className="h-4 w-4 text-green-400" />
                                                                <span>{contest.participantCount || 0} participants</span>
                                                            </div>
                                                        </div>

                                                        {/* Start Time */}
                                                        <p className="text-xs text-gray-500 mb-4">
                                                            {isLive ? 'Ends: ' : 'Starts: '}
                                                            {new Date(isLive ? contest.endTime : contest.startTime).toLocaleString()}
                                                        </p>

                                                        {/* Join Button */}
                                                        {isLive && (
                                                            <button
                                                                onClick={() => navigate(`/super-contest/${contest._id}`)}
                                                                className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-yellow-500/30 transition-all hover:shadow-xl hover:shadow-yellow-500/40 hover:scale-105 flex items-center justify-center gap-2"
                                                            >
                                                                <Zap className="h-5 w-5" />
                                                                Join Now!
                                                            </button>
                                                        )}
                                                        {isUpcoming && (
                                                            <button
                                                                disabled
                                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-gray-400 font-semibold rounded-xl cursor-not-allowed"
                                                            >
                                                                Not Started Yet
                                                            </button>
                                                        )}
                                                        {!isLive && !isUpcoming && (
                                                            <button
                                                                disabled
                                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-gray-400 font-semibold rounded-xl cursor-not-allowed"
                                                            >
                                                                Contest Ended
                                                            </button>
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Recent Results */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
                                                <Award className="h-6 w-6 text-green-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-white">Recent Results</h2>
                                                <p className="text-gray-400 text-sm">Your latest performance</p>
                                            </div>
                                        </div>
                                        {results.length > 0 && (
                                            <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
                                                <span className="text-green-300 font-semibold text-sm">{results.length} Result{results.length !== 1 ? 's' : ''}</span>
                                            </div>
                                        )}
                                    </div>

                                    {results.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800/50 rounded-full mb-4">
                                                <Award className="h-10 w-10 text-gray-600" />
                                            </div>
                                            <p className="text-gray-400 text-lg font-medium">No results yet</p>
                                            <p className="text-gray-500 text-sm mt-2">Take a test to see your performance</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {results.slice(0, 3).map((result, index) => (
                                                <motion.div
                                                    key={result._id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    onClick={() => result.test && handleViewResult(result.test._id)}
                                                    className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-5 hover:border-primary-500/30 hover:shadow-xl transition-all duration-300 cursor-pointer"
                                                >
                                                    <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${result.percentage >= 75
                                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                                        : result.percentage >= 50
                                                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                                            : 'bg-gradient-to-r from-red-500 to-rose-500'
                                                        }`}></div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-lg text-white mb-1 group-hover:text-primary-300 transition-colors">{result.test?.title || 'Deleted Test'}</h3>
                                                            <p className="text-gray-400 text-sm flex items-center gap-2">
                                                                <span className="px-2 py-0.5 bg-white/5 rounded-md text-xs">{result.test?.subject || '-'}</span>
                                                                <span className="text-gray-600">•</span>
                                                                <span className="text-xs">{new Date(result.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <p className="text-3xl font-bold text-white">{result.score}</p>
                                                                <p className="text-sm text-gray-500">/ {result.test?.totalMarks || '-'}</p>
                                                            </div>
                                                            <div className={`px-4 py-2 rounded-xl border ${result.percentage >= 75
                                                                ? 'bg-green-500/20 text-green-300 border-green-500/40'
                                                                : result.percentage >= 50
                                                                    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                                                                    : 'bg-red-500/20 text-red-300 border-red-500/40'
                                                                }`}>
                                                                <span className="text-xl font-bold">{result.percentage}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            </div>

                            {/* Right Column - Study Materials & Notifications */}
                            <div className="space-y-8">
                                {/* Study Materials */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl">
                                            <BookMarked className="h-6 w-6 text-orange-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Study Materials</h2>
                                            <p className="text-gray-400 text-xs">Download resources</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {(showAllMaterials ? studyMaterials : studyMaterials.slice(0, 4)).map((material, index) => (
                                            <motion.div
                                                key={material._id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                onClick={() => {
                                                    const url = material.fileUrl.startsWith('http')
                                                        ? material.fileUrl
                                                        : `${material.fileUrl}`;
                                                    window.open(url, '_blank');
                                                }}
                                                className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-4 hover:border-orange-500/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-orange-500/20 rounded-lg group-hover:scale-110 transition-transform">
                                                        <BookOpen className="h-5 w-5 text-orange-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2 group-hover:text-orange-300 transition-colors">{material.title}</h3>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <span className="px-2 py-0.5 bg-white/5 rounded text-xs">{material.subject}</span>
                                                            <span>•</span>
                                                            <span>{material.fileSize}</span>
                                                            {material.uploadedBy && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="text-blue-400">
                                                                        {material.uploadedBy.role === 'principal' ? 'Principal' : material.uploadedBy.name}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button className="p-2 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg transition-colors">
                                                        <Download className="h-4 w-4 text-orange-400" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setShowAllMaterials(!showAllMaterials)}
                                        className="w-full mt-4 py-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 border border-orange-500/30 rounded-xl text-orange-300 font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        {showAllMaterials ? 'Show Less' : `View All Materials (${studyMaterials.length})`}
                                        <ChevronRight className={`h-4 w-4 transition-transform ${showAllMaterials ? 'rotate-90' : ''}`} />
                                    </button>
                                </motion.div>

                                {/* Notifications */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl">
                                                <Bell className="h-6 w-6 text-yellow-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white">Notifications</h2>
                                                <p className="text-gray-400 text-xs">Stay updated</p>
                                            </div>
                                        </div>
                                        {stats.notifications > 0 && (
                                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">{stats.notifications}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {(showAllNotifications ? notifications : notifications.slice(0, 4)).map((notification, index) => (
                                            <motion.div
                                                key={notification._id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                onClick={() => handleNotificationClick(notification)}
                                                className={`group bg-gradient-to-br from-white/5 to-white/[0.02] border ${notification.isRead ? 'border-white/5' : 'border-yellow-500/30'
                                                    } rounded-xl p-4 hover:border-yellow-500/40 hover:shadow-lg transition-all duration-300 cursor-pointer`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-lg ${notification.type === 'test' ? 'bg-blue-500/20' :
                                                        notification.type === 'result' ? 'bg-green-500/20' :
                                                            notification.type === 'material' ? 'bg-orange-500/20' :
                                                                'bg-yellow-500/20'
                                                        }`}>
                                                        {notification.type === 'test' && <FileText className="h-4 w-4 text-blue-400" />}
                                                        {notification.type === 'result' && <Award className="h-4 w-4 text-green-400" />}
                                                        {notification.type === 'material' && <BookOpen className="h-4 w-4 text-orange-400" />}
                                                        {notification.type === 'reminder' && <Bell className="h-4 w-4 text-yellow-400" />}
                                                        {notification.type === 'announcement' && <Bell className="h-4 w-4 text-purple-400" />}
                                                        {notification.type === 'general' && <Bell className="h-4 w-4 text-gray-400" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className={`font-semibold text-sm mb-1 line-clamp-2 ${notification.isRead ? 'text-gray-400' : 'text-white'
                                                            }`}>{notification.title}</h3>
                                                        <div className="flex flex-col gap-0.5">
                                                            <p className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</p>
                                                            {notification.createdBy && (
                                                                <p className="text-xs text-blue-400 font-medium">
                                                                    {notification.createdBy.role === 'principal' ? 'Principal' : notification.createdBy.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {!notification.isRead && (
                                                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setShowAllNotifications(!showAllNotifications)}
                                        className="w-full mt-4 py-3 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 hover:from-yellow-500/20 hover:to-amber-500/20 border border-yellow-500/30 rounded-xl text-yellow-300 font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        {showAllNotifications ? 'Show Less' : `View All Notifications (${notifications.length})`}
                                        <ChevronRight className={`h-4 w-4 transition-transform ${showAllNotifications ? 'rotate-90' : ''}`} />
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Result Details Modal */}
            {showResultModal && selectedResult && (
                <ResultDetailsModal
                    result={selectedResult}
                    onClose={() => {
                        setShowResultModal(false);
                        setSelectedResult(null);
                    }}
                />
            )}
        </div>
    );
};

export default StudentDashboard;
