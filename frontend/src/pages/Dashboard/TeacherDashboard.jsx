import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, FileText, TrendingUp, Download, User, GraduationCap, Calendar,
    Award, BarChart3, BookOpen, Bell, Target, CheckCircle2, XCircle, Clock,
    Plus, Upload, Trash2, AlertCircle, X, Check, Ban
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from '../../utils/toast';

import SuperContestResultsSection from '../../components/SuperContestResultsSection';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [results, setResults] = useState([]);
    const [tests, setTests] = useState([]);
    const [studyMaterials, setStudyMaterials] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Form states
    const [showTestForm, setShowTestForm] = useState(false);
    const [testForm, setTestForm] = useState({
        title: '',
        description: '',
        class: '',
        subject: '',
        duration: '',
        totalMarks: '',
        scheduledDate: ''
    });

    const [showNotificationForm, setShowNotificationForm] = useState(false);
    const [notificationForm, setNotificationForm] = useState({
        title: '',
        message: '',
        type: 'general',
        priority: 'medium',
        classes: [],
        expiresAt: ''
    });

    const [showMaterialForm, setShowMaterialForm] = useState(false);
    const [materialForm, setMaterialForm] = useState({
        title: '',
        subject: '',
        description: '',
        fileUrl: '',
        fileType: 'PDF',
        fileSize: '',
        class: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [resultsRes, testsRes, materialsRes, notificationsRes, studentsRes] = await Promise.all([
                axios.get(`/api/results/school/${user.school._id}`, config),
                axios.get('/api/tests', config),
                axios.get('/api/study-materials', config),
                axios.get('/api/notifications', config),
                axios.get('/api/students/school', config) // Teachers see all students in school or filter by class
            ]);

            setResults(resultsRes.data);
            setTests(testsRes.data);
            setStudyMaterials(materialsRes.data);
            setNotifications(notificationsRes.data);
            setStudents(studentsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleCreateTest = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/tests', {
                ...testForm,
                schools: [], // Backend expects schools array
                questions: [] // Initialize with empty questions, add question management later
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('✅ Test created successfully!');
            setShowTestForm(false);
            setTestForm({
                title: '',
                description: '',
                class: '',
                subject: '',
                duration: '',
                totalMarks: '',
                scheduledDate: ''
            });
            fetchData();
        } catch (error) {
            console.error('Error creating test:', error);
            toast.error('❌ Failed to create test');
        }
    };

    const handleCreateNotification = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...notificationForm,
                targetAudience: {
                    classes: notificationForm.classes
                }
            };
            // Remove empty expiresAt to avoid Mongoose CastError
            if (!payload.expiresAt) delete payload.expiresAt;

            console.log('🔵 Creating notification with payload:', payload);
            console.log('🔵 Token:', token ? 'Present' : 'Missing');

            const response = await axios.post('/api/notifications', payload, { headers: { Authorization: `Bearer ${token}` } });

            console.log('✅ Notification created successfully:', response.data);
            toast.success('✅ Notification sent successfully!');
            setShowNotificationForm(false);
            setNotificationForm({
                title: '',
                message: '',
                type: 'general',
                priority: 'medium',
                classes: [],
                expiresAt: ''
            });
            fetchData();
        } catch (error) {
            console.error('❌ Error creating notification:', error);
            console.error('❌ Error response:', error.response?.data);
            console.error('❌ Error status:', error.response?.status);
            toast.error('❌ Failed to send notification');
        }
    };



    const handleUploadMaterial = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                title: materialForm.title,
                subject: materialForm.subject,
                description: materialForm.description,
                fileUrl: materialForm.fileUrl, // Using link instead of upload
                fileType: materialForm.fileType,
                class: materialForm.class,
                schools: [] // Backend expects schools array, will auto-set for teachers
            };

            console.log('🔵 Uploading study material with payload:', payload);
            console.log('🔵 Token:', token ? 'Present' : 'Missing');

            const response = await axios.post('/api/study-materials', payload, { headers: { Authorization: `Bearer ${token}` } });

            console.log('✅ Study material uploaded successfully:', response.data);
            toast.success('✅ Study material added successfully!');
            setShowMaterialForm(false);
            setMaterialForm({
                title: '',
                subject: '',
                description: '',
                fileUrl: '',
                fileType: 'PDF',
                fileSize: '',
                class: ''
            });
            fetchData();
        } catch (error) {
            console.error('❌ Error uploading material:', error);
            console.error('❌ Error response:', error.response?.data);
            console.error('❌ Error status:', error.response?.status);
            toast.error('❌ Failed to upload material');
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        if (!window.confirm('Are you sure you want to delete this notification?')) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/notifications/${notificationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('✅ Notification deleted successfully!');
            fetchData();
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('❌ Failed to delete notification');
        }
    };

    const handleDeleteTest = async (testId) => {
        if (!window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/tests/${testId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('✅ Test deleted successfully!');
            fetchData();
        } catch (error) {
            console.error('Error deleting test:', error);
            toast.error('❌ Failed to delete test');
        }
    };

    const handleDeleteMaterial = async (materialId) => {
        if (!window.confirm('Are you sure you want to delete this study material?')) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/study-materials/${materialId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('✅ Study material deleted successfully!');
            fetchData();
        } catch (error) {
            console.error('Error deleting material:', error);
            toast.error('❌ Failed to delete study material');
        }
    };

    const stats = {
        totalStudents: students.length,
        totalTests: tests.length,
        avgPerformance: results.length > 0
            ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(1)
            : 0,
        passRate: results.length > 0
            ? ((results.filter(r => r.percentage >= 50).length / results.length) * 100).toFixed(1)
            : 0,
        materials: studyMaterials.length,
        notifications: notifications.length
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
                    <p className="text-gray-400">Teacher Dashboard • {user?.school?.name} • {user?.subject || 'No Subject'}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    {[
                        { label: 'Students', value: stats.totalStudents, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                        { label: 'Tests', value: stats.totalTests, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                        { label: 'Avg Score', value: `${stats.avgPerformance}%`, icon: BarChart3, color: 'text-green-400', bg: 'bg-green-500/10' },
                        { label: 'Pass Rate', value: `${stats.passRate}%`, icon: Target, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                        { label: 'Materials', value: stats.materials, icon: BookOpen, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                        { label: 'Notifications', value: stats.notifications, icon: Bell, color: 'text-red-400', bg: 'bg-red-500/10' }
                    ].map((stat, index) => (
                        <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-4">
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
                        { id: 'tests', label: 'Tests', icon: FileText },
                        { id: 'materials', label: 'Study Materials', icon: BookOpen },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'students', label: 'My Class', icon: Users }
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
                            <h2 className="text-2xl font-bold text-white mb-6">Recent Results</h2>
                            <div className="space-y-3">
                                {results.filter(r => r.test && r.student).slice(0, 5).map((result) => (
                                    <div key={result._id} className="flex items-center justify-between bg-white/5 p-4 rounded-xl">
                                        <div>
                                            <p className="text-white font-semibold">{result.student?.name || 'Unknown Student'}</p>
                                            <p className="text-sm text-gray-400">{result.test?.title}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-white">{result.score}/{result.test?.totalMarks || '-'}</p>
                                            <p className={`text-sm font-medium ${result.percentage >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                                                {result.percentage}%
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {results.length === 0 && <p className="text-gray-400 text-center">No results found.</p>}
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
                                    onClick={() => setShowTestForm(!showTestForm)}
                                    className="px-4 py-2 bg-primary-500 text-white rounded-xl font-semibold flex items-center gap-2"
                                >
                                    <Plus className="h-5 w-5" /> Create Test
                                </button>
                            </div>

                            {showTestForm && (
                                <form onSubmit={handleCreateTest} className="bg-white/5 p-6 rounded-2xl mb-6 border border-white/10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input
                                            type="text"
                                            placeholder="Test Title"
                                            required
                                            value={testForm.title}
                                            onChange={e => setTestForm({ ...testForm, title: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Subject"
                                            required
                                            value={testForm.subject}
                                            onChange={e => setTestForm({ ...testForm, subject: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                                        />
                                        <select
                                            required
                                            value={testForm.class}
                                            onChange={e => setTestForm({ ...testForm, class: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                                        >
                                            <option value="" className="text-black">Select Class</option>
                                            {[...Array(12)].map((_, i) => (
                                                <option key={i + 1} value={i + 1} className="text-black">Class {i + 1}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="Duration (mins)"
                                            required
                                            value={testForm.duration}
                                            onChange={e => setTestForm({ ...testForm, duration: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Total Marks"
                                            required
                                            value={testForm.totalMarks}
                                            onChange={e => setTestForm({ ...testForm, totalMarks: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                                        />
                                        <input
                                            type="datetime-local"
                                            required
                                            value={testForm.scheduledDate}
                                            onChange={e => setTestForm({ ...testForm, scheduledDate: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                                        />
                                    </div>
                                    <textarea
                                        placeholder="Description"
                                        value={testForm.description}
                                        onChange={e => setTestForm({ ...testForm, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white mb-4"
                                    />
                                    <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded-xl font-semibold">Create Test</button>
                                </form>
                            )}

                            <div className="space-y-3">
                                {tests.map((test) => (
                                    <div key={test._id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center group">
                                        <div>
                                            <h3 className="text-white font-semibold">{test.title}</h3>
                                            <p className="text-gray-400 text-sm">{test.subject} • Class {test.class} • {test.duration} mins</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteTest(test._id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100"
                                            title="Delete Test"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'materials' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">Study Materials</h2>
                                <button
                                    onClick={() => setShowMaterialForm(!showMaterialForm)}
                                    className="px-4 py-2 bg-primary-500 text-white rounded-xl font-semibold flex items-center gap-2"
                                >
                                    <Upload className="h-5 w-5" /> Upload
                                </button>
                            </div>

                            {showMaterialForm && (
                                <form onSubmit={handleUploadMaterial} className="bg-white/5 p-6 rounded-2xl mb-6 border border-white/10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input
                                            type="text"
                                            placeholder="Title"
                                            required
                                            value={materialForm.title}
                                            onChange={e => setMaterialForm({ ...materialForm, title: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Subject"
                                            required
                                            value={materialForm.subject}
                                            onChange={e => setMaterialForm({ ...materialForm, subject: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                                        />
                                        <select
                                            required
                                            value={materialForm.class}
                                            onChange={e => setMaterialForm({ ...materialForm, class: e.target.value })}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                                        >
                                            <option value="" className="text-black">Select Class</option>
                                            {[...Array(12)].map((_, i) => (
                                                <option key={i + 1} value={i + 1} className="text-black">Class {i + 1}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="url"
                                            placeholder="Enter document link (Google Drive, Dropbox, etc.)"
                                            required
                                            value={materialForm.fileUrl}
                                            onChange={e => setMaterialForm({ ...materialForm, fileUrl: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                                        />
                                    </div>
                                    <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded-xl font-semibold">Upload</button>
                                </form>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {studyMaterials.map((material) => (
                                    <div key={material._id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-start">
                                        <div>
                                            <h3 className="text-white font-semibold">{material.title}</h3>
                                            <p className="text-gray-400 text-sm">{material.subject} • Class {material.class}</p>
                                            <a href={material.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm mt-2 inline-block hover:underline">View File</a>
                                        </div>
                                        {material.uploadedBy?._id === user._id && (
                                            <button
                                                onClick={() => handleDeleteMaterial(material._id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                                                title="Delete Material"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'notifications' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">Notifications</h2>
                                <button
                                    onClick={() => setShowNotificationForm(!showNotificationForm)}
                                    className="px-4 py-2 bg-primary-500 text-white rounded-xl font-semibold flex items-center gap-2"
                                >
                                    <Plus className="h-5 w-5" /> Create
                                </button>
                            </div>

                            {showNotificationForm && (
                                <form onSubmit={handleCreateNotification} className="bg-white/5 p-6 rounded-2xl mb-6 border border-white/10">
                                    <div className="mb-4">
                                        <input
                                            type="text"
                                            placeholder="Title"
                                            required
                                            value={notificationForm.title}
                                            onChange={e => setNotificationForm({ ...notificationForm, title: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white mb-4"
                                        />
                                        <textarea
                                            placeholder="Message"
                                            required
                                            value={notificationForm.message}
                                            onChange={e => setNotificationForm({ ...notificationForm, message: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                                        />
                                    </div>
                                    <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded-xl font-semibold">Send</button>
                                </form>
                            )}

                            <div className="space-y-3">
                                {notifications.map((notif) => (
                                    <div key={notif._id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-start group">
                                        <div>
                                            <h3 className="text-white font-semibold">{notif.title}</h3>
                                            <p className="text-gray-400 text-sm">{notif.message}</p>
                                            <p className="text-xs text-gray-500 mt-2">{new Date(notif.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteNotification(notif._id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100"
                                            title="Delete Notification"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'students' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">My Class Students</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-gray-300">
                                    <thead className="text-xs uppercase bg-white/5 text-gray-400">
                                        <tr>
                                            <th className="px-6 py-3 rounded-l-xl">Name</th>
                                            <th className="px-6 py-3">Roll No</th>
                                            <th className="px-6 py-3">Email</th>
                                            <th className="px-6 py-3 rounded-r-xl">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student) => (
                                            <tr key={student._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-medium text-white">{student.name}</td>
                                                <td className="px-6 py-4">{student.rollNumber}</td>
                                                <td className="px-6 py-4">{student.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${student.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {student.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}


                </AnimatePresence>
            </div>
        </div>
    );
};

export default TeacherDashboard;
