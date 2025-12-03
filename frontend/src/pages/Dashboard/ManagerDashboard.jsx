import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, FileText, TrendingUp, Download, User, GraduationCap, Calendar,
    Award, BarChart3, BookOpen, Bell, Target, CheckCircle2, XCircle, Clock,
    Plus, Upload, Trash2, AlertCircle, X, Check, Ban, School, Trophy, Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TestCreationModal from '../../components/TestCreationModal';
import SchoolAssignmentModal from '../../components/SchoolAssignmentModal';
import SuperContestSection from '../../components/SuperContestSection';
import SuperContestResultsSection from '../../components/SuperContestResultsSection';

const ManagerDashboard = () => {
    const { user } = useAuth();
    const [results, setResults] = useState([]);
    const [tests, setTests] = useState([]);
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const [messages, setMessages] = useState([]);

    // Form states
    const [showTestModal, setShowTestModal] = useState(false);
    const [showSchoolModal, setShowSchoolModal] = useState(false);
    const [selectedTest, setSelectedTest] = useState(null);

    // Results View State
    const [viewMode, setViewMode] = useState('schools'); // schools, classes, results
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);

    const handleSchoolClick = (school) => {
        setSelectedSchool(school);
        setViewMode('classes');
    };

    const handleClassClick = (classNum) => {
        setSelectedClass(classNum);
        setViewMode('results');
    };

    const handleBackToSchools = () => {
        setSelectedSchool(null);
        setSelectedClass(null);
        setViewMode('schools');
    };

    const handleBackToClasses = () => {
        setSelectedClass(null);
        setViewMode('classes');
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [resultsRes, testsRes, schoolsRes, messagesRes] = await Promise.all([
                axios.get('/api/results', config), // Manager sees all results
                axios.get('/api/tests', config),
                axios.get('/api/admin/schools', config), // Need endpoint to get schools
                axios.get('/api/contact', config)
            ]);

            setResults(resultsRes.data);
            setTests(testsRes.data);
            setSchools(schoolsRes.data);
            setMessages(messagesRes.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleDeleteTest = async (testId) => {
        if (window.confirm('Are you sure you want to delete this test?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/tests/${testId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTests(tests.filter(test => test._id !== testId));
                alert('Test deleted successfully');
            } catch (error) {
                console.error('Error deleting test:', error);
                alert('Failed to delete test');
            }
        }
    };

    const handleDeleteMessage = async (id) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/contact/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(messages.filter(msg => msg._id !== id));
                alert('✅ Message deleted successfully');
            } catch (error) {
                console.error('Error deleting message:', error);
                alert('❌ Failed to delete message');
            }
        }
    };



    const stats = {
        totalTests: tests.length,
        totalSchools: schools.length,
        totalResults: results.length,
        avgPerformance: results.length > 0
            ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(1)
            : 0,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary-500/20 border-t-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Welcome, {user?.name}! 👋</h1>
                    <p className="text-gray-400">Manager Dashboard • System Wide Access</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Active Tests', value: stats.totalTests, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                        { label: 'Schools', value: stats.totalSchools, icon: School, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                        { label: 'Total Results', value: stats.totalResults, icon: BarChart3, color: 'text-green-400', bg: 'bg-green-500/10' },
                        { label: 'Avg Performance', value: `${stats.avgPerformance}%`, icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                    ].map((stat, index) => (
                        <div
                            key={index}
                            onClick={() => {
                                if (stat.label === 'Active Tests') setActiveTab('tests');
                                else if (stat.label === 'Total Results' || stat.label === 'Avg Performance') setActiveTab('results');
                                else setActiveTab('overview');
                            }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4 cursor-pointer hover:bg-white/10 transition-colors"
                        >
                            <div className={`p-2 rounded-lg w-fit mb-3 ${stat.bg}`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <p className="text-gray-400 text-xs uppercase font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'tests', label: 'Test Management', icon: FileText },
                        { id: 'super-contests', label: 'Super Contests', icon: Trophy },
                        { id: 'contest-results', label: 'Contest Results', icon: Award },
                        { id: 'results', label: 'All Results', icon: Award },
                        { id: 'messages', label: 'Messages', icon: Mail }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-primary-500 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <tab.icon className="h-5 w-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">System Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                    <h3 className="text-xl font-semibold text-white mb-4">Recent Tests</h3>
                                    <div className="space-y-3">
                                        {tests.slice(0, 5).map(test => (
                                            <div key={test._id} className="flex justify-between items-center text-gray-300 border-b border-white/5 pb-2 last:border-0">
                                                <span>{test.title}</span>
                                                <span className="text-sm bg-white/10 px-2 py-1 rounded">{test.schools.length} Schools</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                    <h3 className="text-xl font-semibold text-white mb-4">Top Performing Schools</h3>
                                    {/* Placeholder for school performance logic */}
                                    <p className="text-gray-400">Analytics coming soon...</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'tests' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">Manage Tests</h2>
                                <button
                                    onClick={() => setShowTestModal(true)}
                                    className="px-4 py-2 bg-primary-500 text-white rounded-xl font-semibold flex items-center gap-2"
                                >
                                    <Plus className="h-5 w-5" /> Create Test
                                </button>
                            </div>

                            <AnimatePresence>
                                {showTestModal && (
                                    <TestCreationModal
                                        onClose={() => setShowTestModal(false)}
                                        onSuccess={fetchData}
                                    />
                                )}
                                {showSchoolModal && selectedTest && (
                                    <SchoolAssignmentModal
                                        test={selectedTest}
                                        onClose={() => {
                                            setShowSchoolModal(false);
                                            setSelectedTest(null);
                                        }}
                                        onSuccess={fetchData}
                                    />
                                )}
                            </AnimatePresence>

                            <div className="space-y-3">
                                {tests.map((test) => (
                                    <div key={test._id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-white font-semibold">{test.title}</h3>
                                            <p className="text-gray-400 text-sm">{test.subject} • Class {test.class}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedTest(test);
                                                        setShowSchoolModal(true);
                                                    }}
                                                    className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full hover:bg-blue-500/30 transition-colors cursor-pointer flex items-center gap-1"
                                                >
                                                    <School size={12} />
                                                    {test.schools.length} Schools Assigned
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteTest(test._id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                                                title="Delete Test"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'results' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6"
                        >
                            {viewMode === 'schools' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-6">Select School</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {schools.map((school) => (
                                            <div
                                                key={school._id}
                                                onClick={() => handleSchoolClick(school)}
                                                className="bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-xl cursor-pointer transition-all group"
                                            >
                                                <div className="flex items-center gap-4 mb-3">
                                                    <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                                                        <School className="h-6 w-6 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white">{school.name}</h3>
                                                        <p className="text-sm text-gray-400">Code: {school.code}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-sm text-gray-400">
                                                    <span>Max Class: {school.maxClass}</span>
                                                    <span className="text-blue-400 group-hover:translate-x-1 transition-transform">View Classes →</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {viewMode === 'classes' && selectedSchool && (
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <button
                                            onClick={handleBackToSchools}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                        >
                                            ← Back
                                        </button>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">{selectedSchool.name}</h2>
                                            <p className="text-gray-400">Select a Class</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {Array.from({ length: selectedSchool.maxClass }, (_, i) => i + 1).map((classNum) => (
                                            <button
                                                key={classNum}
                                                onClick={() => handleClassClick(classNum)}
                                                className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl transition-all text-center group"
                                            >
                                                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-500/30 transition-colors">
                                                    <Users className="h-6 w-6 text-purple-400" />
                                                </div>
                                                <span className="text-lg font-bold text-white">Class {classNum}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {viewMode === 'results' && selectedSchool && selectedClass && (
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <button
                                            onClick={handleBackToClasses}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                        >
                                            ← Back
                                        </button>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">Class {selectedClass} Results</h2>
                                            <p className="text-gray-400">{selectedSchool.name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {results.filter(r =>
                                            (r.student?.school?._id === selectedSchool._id || r.school?._id === selectedSchool._id) &&
                                            (r.student?.class === selectedClass) && r.test && r.student
                                        ).length === 0 ? (
                                            <div className="text-center py-12 text-gray-400">
                                                No results found for this class.
                                            </div>
                                        ) : (
                                            results.filter(r =>
                                                (r.student?.school?._id === selectedSchool._id || r.school?._id === selectedSchool._id) &&
                                                (r.student?.class === selectedClass) && r.test && r.student
                                            ).map((result) => (
                                                <div key={result._id} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-white/5 rounded-full">
                                                            <User className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-semibold text-lg">{result.student?.name || 'Unknown Student'}</p>
                                                            <p className="text-sm text-gray-400">
                                                                {result.test?.title || 'Unknown Test'} • Roll No: {result.student?.rollNumber || '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-white">{result.score}/{result.test?.totalMarks || '-'}</p>
                                                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${result.percentage >= 50 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                            {result.percentage >= 50 ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                                            {result.percentage}%
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'super-contests' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <SuperContestSection />
                        </motion.div>
                    )}

                    {activeTab === 'contest-results' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <SuperContestResultsSection />
                        </motion.div>
                    )}

                    {activeTab === 'messages' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Contact Messages</h2>
                            <div className="grid gap-4">
                                {messages.length === 0 ? (
                                    <div className="text-center py-12 bg-[#1e293b] rounded-xl border border-white/5">
                                        <Mail className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                                        <p className="text-gray-400">No messages yet</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div key={msg._id} className="bg-[#1e293b] border border-white/5 rounded-xl p-6 hover:border-primary-500/30 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white">{msg.name}</h3>
                                                    <p className="text-primary-400 text-sm">{msg.email}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(msg.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteMessage(msg._id)}
                                                        className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Delete Message"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-gray-300 whitespace-pre-wrap">{msg.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ManagerDashboard;
