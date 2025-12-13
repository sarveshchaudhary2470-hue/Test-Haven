import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, Plus, Trash2, Users, Clock, Calendar, Award,
    Target, Zap, Star, Crown, Medal, X, Check, Shuffle, Hash, School, Upload, Download, Sparkles
} from 'lucide-react';
import { parseQuestionsFromExcel } from '../utils/excelUtils';
import AIGenerationModal from './AIGenerationModal';

import { useAuth } from '../context/AuthContext';

const SuperContestSection = () => {
    const { user } = useAuth();
    const [contests, setContests] = useState([]);
    const [schools, setSchools] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [numQuestions, setNumQuestions] = useState(5);
    const initialFormData = {
        title: '',
        description: '',
        subject: '',
        schools: [],
        classes: [],
        duration: 30,
        totalMarks: 100,
        questions: [],
        startTime: '',
        endTime: '',
        randomizeQuestions: false,
        randomizeOptions: false
    };

    const [formData, setFormData] = useState(initialFormData);

    const handleCloseForm = () => {
        setFormData(initialFormData);
        setNumQuestions(5);
        setShowForm(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const promises = [axios.get('/api/super-contests', config)];

            // Only fetch schools if user is admin or manager
            if (user && ['admin', 'manager'].includes(user.role)) {
                promises.push(axios.get('/api/admin/schools', config));
            }

            const results = await Promise.all(promises);
            const contestsRes = results[0];
            const schoolsRes = results[1]; // This will be undefined if not fetched

            setContests(contestsRes.data.data || []);
            if (schoolsRes) {
                setSchools(schoolsRes.data || []);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleClassToggle = (classNum) => {
        setFormData(prev => ({
            ...prev,
            classes: prev.classes.includes(classNum)
                ? prev.classes.filter(c => c !== classNum)
                : [...prev.classes, classNum]
        }));
    };

    // Handler for File Upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const parsedQuestions = await parseQuestionsFromExcel(file);

            setFormData(prev => {
                const newQuestions = [...prev.questions, ...parsedQuestions];
                return {
                    ...prev,
                    questions: newQuestions
                };
            });

            alert(`✅ Successfully added ${parsedQuestions.length} questions from Excel!`);
        } catch (error) {
            console.error(error);
            alert(`❌ Error parsing Excel: ${error.message}`);
        } finally {
            e.target.value = ''; // Reset
        }
    };

    const handleAIGeneratedQuestions = (generatedQuestions) => {
        setFormData(prev => {
            const isDefault = prev.questions.length === 1 &&
                !prev.questions[0].question &&
                prev.questions[0].options.every(opt => opt === '');

            const newQuestions = isDefault
                ? generatedQuestions
                : [...prev.questions, ...generatedQuestions];

            return {
                ...prev,
                questions: newQuestions
            };
        });
        alert(`✨ AI successfully generated ${generatedQuestions.length} questions!`);
    };

    const handleBulkAddQuestions = () => {
        const newQuestions = [];
        for (let i = 0; i < numQuestions; i++) {
            newQuestions.push({
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0,
                marks: 1
            });
        }
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleAddQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, {
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0,
                marks: 1
            }]
        }));
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[index][field] = value;
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[qIndex].options[oIndex] = value;
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleRemoveQuestion = (index) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    const handleRandomizeQuestions = () => {
        setFormData(prev => ({
            ...prev,
            questions: shuffleArray(prev.questions)
        }));
        alert('✨ Questions randomized!');
    };

    const [globalMarks, setGlobalMarks] = useState(1);

    const handleApplyMarksToAll = () => {
        if (formData.questions.length === 0) return;
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.map(q => ({ ...q, marks: globalMarks }))
        }));
        alert(`✅ Updated all ${formData.questions.length} questions to ${globalMarks} marks!`);
    };

    const handleRandomizeOptions = (qIndex) => {
        const newQuestions = [...formData.questions];
        const question = newQuestions[qIndex];
        const correctOption = question.options[question.correctAnswer];

        const shuffled = shuffleArray(question.options);
        const newCorrectIndex = shuffled.indexOf(correctOption);

        newQuestions[qIndex].options = shuffled;
        newQuestions[qIndex].correctAnswer = newCorrectIndex;

        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Only validate school selection for admin/manager
        if (['admin', 'manager'].includes(user?.role) && formData.schools.length === 0) {
            alert('Please select at least one school');
            return;
        }

        if (formData.classes.length === 0) {
            alert('Please select at least one class');
            return;
        }

        if (formData.questions.length < 1) {
            alert('Please add at least 1 question');
            return;
        }

        // Validate duration and time gap
        const start = new Date(formData.startTime);
        const end = new Date(formData.endTime);
        const durationMs = formData.duration * 60 * 1000;
        const gapMs = end - start;

        if (gapMs < durationMs) {
            alert(`Invalid time range! The gap between Start Time and End Time must be at least ${formData.duration} minutes (the contest duration).`);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Create payload with ISO formatted date strings to handle timezone correctly
            const payload = {
                ...formData,
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString()
            };

            await axios.post('/api/super-contests', payload, config);
            alert('🏆 Super Contest created successfully!');
            handleCloseForm();
            fetchData();
        } catch (error) {
            console.error('Error creating contest:', error);
            alert('Failed to create contest: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This will delete the contest and ALL related results permanently!')) return;

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`/api/super-contests/${id}`, config);
            alert('Contest and all results deleted successfully!');
            fetchData();
        } catch (error) {
            console.error('Error deleting contest:', error);
            alert('Failed to delete contest');
        }
    };

    const getStatusBadge = (contest) => {
        const now = new Date();
        const start = new Date(contest.startTime);
        const end = new Date(contest.endTime);

        if (now < start) {
            return <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-semibold">Upcoming</span>;
        } else if (now >= start && now <= end) {
            return <span className="px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/40 rounded-lg text-xs font-semibold animate-pulse">🔴 Live</span>;
        } else {
            return <span className="px-3 py-1 bg-gray-500/20 text-gray-300 border border-gray-500/40 rounded-lg text-xs font-semibold">Completed</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    const allClasses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl">
                        <Trophy className="h-8 w-8 text-yellow-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                            Super Contests
                        </h2>
                        <p className="text-gray-400 text-sm">Competitive testing with live leaderboards</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-yellow-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/40 hover:scale-105 flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Create Contest
                </button>
            </div>

            {/* Contest Grid */}
            {contests.length === 0 ? (
                <div className="text-center py-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
                    <Trophy className="h-20 w-20 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No super contests yet</p>
                    <p className="text-gray-500 text-sm mt-2">Create your first competitive test!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contests.map((contest, index) => (
                        <motion.div
                            key={contest._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:border-yellow-500/50 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300"
                        >
                            {/* Trophy Icon */}
                            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Crown className="h-8 w-8 text-white" />
                            </div>

                            {/* Status Badge */}
                            <div className="mb-4">
                                {getStatusBadge(contest)}
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                                {contest.title}
                            </h3>

                            {/* Subject */}
                            <p className="text-gray-400 text-sm mb-4">{contest.subject}</p>

                            {/* Info Grid */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <School className="h-4 w-4 text-orange-400" />
                                    <span>
                                        {contest.schools && contest.schools.length > 0
                                            ? (contest.schools.length === 1 ? contest.schools[0].name : `${contest.schools.length} Schools`)
                                            : (contest.school?.name || 'Unknown School')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Users className="h-4 w-4 text-blue-400" />
                                    <span>Classes: {contest.classes.join(', ')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Clock className="h-4 w-4 text-green-400" />
                                    <span>{contest.duration} minutes</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Target className="h-4 w-4 text-purple-400" />
                                    <span>{contest.totalMarks} marks</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Medal className="h-4 w-4 text-yellow-400" />
                                    <span>{contest.participantCount || 0} participants</span>
                                </div>
                            </div>

                            {/* Start Time */}
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(contest.startTime).toLocaleString()}</span>
                            </div>

                            {/* Delete Button */}
                            <button
                                onClick={() => handleDelete(contest._id)}
                                className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Contest
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={handleCloseForm}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Form Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl">
                                        <Trophy className="h-6 w-6 text-yellow-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Create Super Contest</h3>
                                </div>
                                <button
                                    onClick={handleCloseForm}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="h-6 w-6 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Contest Title *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                                            placeholder="e.g., Mathematics Championship"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Subject *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                                            placeholder="e.g., Mathematics"
                                        />
                                    </div>
                                </div>

                                {/* School Selection */}
                                {user && ['admin', 'manager'].includes(user.role) && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Select Schools * (Select one or more)</label>
                                        <div className="max-h-40 overflow-y-auto bg-white/5 border border-white/10 rounded-xl p-2 grid grid-cols-1 sm:grid-cols-2 gap-2 custom-scrollbar">
                                            {schools.map(school => (
                                                <label key={school._id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.schools.includes(school._id)}
                                                        onChange={(e) => {
                                                            const id = school._id;
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                schools: e.target.checked
                                                                    ? [...prev.schools, id]
                                                                    : prev.schools.filter(s => s !== id)
                                                            }));
                                                        }}
                                                        className="rounded bg-black/20 border-white/10 text-yellow-500 focus:ring-yellow-500/50"
                                                    />
                                                    <span className="text-gray-300 text-sm truncate">{school.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {formData.schools.length === 0 && <p className="text-red-400 text-xs mt-1">Please select at least one school.</p>}
                                    </div>
                                )}

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                                        rows="3"
                                        placeholder="Contest description..."
                                    />
                                </div>

                                {/* Class Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-3">Select Classes * (at least one)</label>
                                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                        {allClasses.map(classNum => (
                                            <button
                                                key={classNum}
                                                type="button"
                                                onClick={() => handleClassToggle(classNum)}
                                                className={`px-3 py-2 rounded-lg font-semibold transition-all text-sm ${formData.classes.includes(classNum)
                                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                                                    : 'bg-white/5 border border-white/10 text-gray-400 hover:border-yellow-500/50'
                                                    }`}
                                            >
                                                {formData.classes.includes(classNum) && <Check className="h-3 w-3 inline mr-1" />}
                                                {classNum}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Duration and Times */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes) *</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            max="180"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Start Time *</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            min={new Date().toISOString().slice(0, 16)}
                                            value={formData.startTime}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const selected = new Date(val);
                                                const now = new Date();
                                                if (selected < now) {
                                                    alert("❌ Cannot select past time!");
                                                    return;
                                                }
                                                setFormData({ ...formData, startTime: val })
                                            }}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">End Time *</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            min={formData.startTime || new Date().toISOString().slice(0, 16)}
                                            value={formData.endTime}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const selected = new Date(val);
                                                const now = new Date();
                                                if (selected < now) {
                                                    alert("❌ Cannot select past time!");
                                                    return;
                                                }
                                                setFormData({ ...formData, endTime: val })
                                            }}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Randomization Settings */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.randomizeQuestions
                                            ? 'bg-purple-500 border-purple-500'
                                            : 'border-gray-400 group-hover:border-purple-400'
                                            }`}>
                                            {formData.randomizeQuestions && <Check className="h-4 w-4 text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={formData.randomizeQuestions}
                                            onChange={(e) => setFormData({ ...formData, randomizeQuestions: e.target.checked })}
                                        />
                                        <div>
                                            <span className="block text-white font-semibold">Randomize Questions</span>
                                            <span className="text-xs text-gray-400">Each student gets a different question order</span>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.randomizeOptions
                                            ? 'bg-purple-500 border-purple-500'
                                            : 'border-gray-400 group-hover:border-purple-400'
                                            }`}>
                                            {formData.randomizeOptions && <Check className="h-4 w-4 text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={formData.randomizeOptions}
                                            onChange={(e) => setFormData({ ...formData, randomizeOptions: e.target.checked })}
                                        />
                                        <div>
                                            <span className="block text-white font-semibold">Randomize Options</span>
                                            <span className="text-xs text-gray-400">Options will be shuffled for each student</span>
                                        </div>
                                    </label>
                                </div>

                                {/* Bulk Question Creation */}
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-blue-300 mb-2">
                                                <Hash className="h-4 w-4 inline mr-1" />
                                                Bulk Create Questions
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={numQuestions}
                                                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                                placeholder="Number of questions"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleBulkAddQuestions}
                                            className="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-300 font-semibold transition-all mt-6"
                                        >
                                            Generate {numQuestions} Questions
                                        </button>
                                    </div>
                                </div>

                                {/* Global Marks Controller */}
                                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <label className="text-sm font-medium text-purple-300 whitespace-nowrap">
                                            <Target className="h-4 w-4 inline mr-2" />
                                            Set Marks for All
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={globalMarks}
                                            onChange={(e) => setGlobalMarks(parseInt(e.target.value) || 1)}
                                            className="w-24 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleApplyMarksToAll}
                                        className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 rounded-lg text-purple-300 font-semibold transition-all text-sm"
                                    >
                                        Apply to All Questions
                                    </button>
                                </div>

                                {/* Questions */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="block text-sm font-medium text-gray-300">Questions (min 1) *</label>
                                        <div className="flex gap-2">
                                            {formData.questions.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={handleRandomizeQuestions}
                                                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 rounded-lg text-purple-300 font-semibold transition-all flex items-center gap-2"
                                                >
                                                    <Shuffle className="h-4 w-4" />
                                                    Shuffle All
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setShowAIModal(true)}
                                                className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 rounded-lg text-purple-300 font-semibold transition-all flex items-center gap-2"
                                            >
                                                <Sparkles className="h-4 w-4" />
                                                Generate AI
                                            </button>


                                            <label className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 rounded-lg text-green-300 font-semibold transition-all flex items-center gap-2 cursor-pointer">
                                                <Upload className="h-4 w-4" />
                                                Upload Excel
                                                <input
                                                    type="file"
                                                    accept=".xlsx, .xls"
                                                    className="hidden"
                                                    onChange={handleFileUpload}
                                                />
                                            </label>

                                            <button
                                                type="button"
                                                onClick={handleAddQuestion}
                                                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-300 font-semibold transition-all flex items-center gap-2"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add One
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                        {formData.questions.map((q, qIndex) => (
                                            <div key={qIndex} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm font-semibold text-yellow-400">Question {qIndex + 1}</span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRandomizeOptions(qIndex)}
                                                            className="p-1 hover:bg-purple-500/20 rounded transition-colors"
                                                            title="Shuffle options"
                                                        >
                                                            <Shuffle className="h-4 w-4 text-purple-400" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveQuestion(qIndex)}
                                                            className="p-1 hover:bg-red-500/20 rounded transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-400" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <input
                                                    type="text"
                                                    required
                                                    value={q.question}
                                                    onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white mb-3 focus:border-yellow-500 focus:outline-none"
                                                    placeholder="Question text..."
                                                />

                                                <div className="grid grid-cols-2 gap-2 mb-3">
                                                    {q.options.map((opt, oIndex) => (
                                                        <input
                                                            key={oIndex}
                                                            type="text"
                                                            required
                                                            value={opt}
                                                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-yellow-500 focus:outline-none"
                                                            placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                                        />
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <select
                                                        value={q.correctAnswer}
                                                        onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', parseInt(e.target.value))}
                                                        className="px-3 py-2 bg-gray-800 border border-white/20 rounded-lg text-white text-sm focus:border-yellow-500 focus:outline-none cursor-pointer"
                                                        style={{ color: 'white', backgroundColor: '#1f2937' }}
                                                    >
                                                        <option value={0} style={{ backgroundColor: '#1f2937', color: 'white' }}>Correct: A</option>
                                                        <option value={1} style={{ backgroundColor: '#1f2937', color: 'white' }}>Correct: B</option>
                                                        <option value={2} style={{ backgroundColor: '#1f2937', color: 'white' }}>Correct: C</option>
                                                        <option value={3} style={{ backgroundColor: '#1f2937', color: 'white' }}>Correct: D</option>
                                                    </select>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="1"
                                                        value={q.marks}
                                                        onChange={(e) => handleQuestionChange(qIndex, 'marks', parseInt(e.target.value))}
                                                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-yellow-500 focus:outline-none"
                                                        placeholder="Marks"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseForm}
                                        className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 font-semibold transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg transition-all"
                                    >
                                        Create Contest
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showAIModal && (
                    <AIGenerationModal
                        onClose={() => setShowAIModal(false)}
                        onGenerate={handleAIGeneratedQuestions}
                        defaultSubject={formData.title} // Use title as fallback hint
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default SuperContestSection;
