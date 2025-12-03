import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, Trash2, CheckCircle, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TestCreationModal = ({ onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [schools, setSchools] = useState([]);
    const [testLanguage, setTestLanguage] = useState('english');
    const [testForm, setTestForm] = useState({
        title: '',
        subject: '',
        class: '',
        duration: 60,
        totalMarks: 100,
        targetSchools: [],
        // Phase 3 Features
        randomizeQuestions: false,
        randomizeOptions: false,
        scheduledPublishAt: '',
        scheduledCloseAt: '',
        questions: [{
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0
        }]
    });

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/admin/schools', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSchools(response.data);
        } catch (error) {
            console.error('Error fetching schools:', error);
        }
    };

    const handleCreateTest = async (e) => {
        e.preventDefault();

        if (testForm.duration < 1) {
            alert('Duration must be at least 1 minute');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...testForm,
                schools: testForm.targetSchools
            };
            await axios.post('/api/tests', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('✅ Test created successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating test:', error);
            alert('❌ Failed to create test');
        } finally {
            setLoading(false);
        }
    };

    const addQuestion = () => {
        setTestForm({
            ...testForm,
            questions: [...testForm.questions, {
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0
            }]
        });
    };

    const removeQuestion = (index) => {
        const newQuestions = testForm.questions.filter((_, i) => i !== index);
        setTestForm({ ...testForm, questions: newQuestions });
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...testForm.questions];
        newQuestions[index][field] = value;
        setTestForm({ ...testForm, questions: newQuestions });
    };

    const updateOption = (qIndex, optIndex, value) => {
        const newQuestions = [...testForm.questions];
        newQuestions[qIndex].options[optIndex] = value;
        setTestForm({ ...testForm, questions: newQuestions });
    };

    const handleSchoolToggle = (schoolId) => {
        const currentSchools = [...testForm.targetSchools];
        const index = currentSchools.indexOf(schoolId);

        if (index === -1) {
            currentSchools.push(schoolId);
        } else {
            currentSchools.splice(index, 1);
        }

        setTestForm({ ...testForm, targetSchools: currentSchools });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Create New Test</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="test-form" onSubmit={handleCreateTest} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Test Title</label>
                                <input
                                    type="text"
                                    required
                                    value={testForm.title}
                                    onChange={e => setTestForm({ ...testForm, title: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500"
                                    placeholder="e.g. Science Mid-Term"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Subject</label>
                                <input
                                    type="text"
                                    required
                                    value={testForm.subject}
                                    onChange={e => setTestForm({ ...testForm, subject: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500"
                                    placeholder="e.g. Science"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Class</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="12"
                                    value={testForm.class}
                                    onChange={e => setTestForm({ ...testForm, class: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Duration (minutes)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={testForm.duration}
                                    onChange={e => setTestForm({ ...testForm, duration: parseInt(e.target.value) })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Total Marks</label>
                                <input
                                    type="number"
                                    required
                                    value={testForm.totalMarks}
                                    onChange={e => setTestForm({ ...testForm, totalMarks: parseInt(e.target.value) })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Target Schools (Optional)</label>
                                <div className="w-full bg-black/20 border border-white/10 rounded-xl p-4 min-h-[100px] max-h-[150px] overflow-y-auto custom-scrollbar space-y-2">
                                    {schools.map(school => (
                                        <label key={school._id} className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${testForm.targetSchools.includes(school._id)
                                                ? 'bg-primary-500 border-primary-500'
                                                : 'border-gray-500 group-hover:border-primary-400'
                                                }`}>
                                                {testForm.targetSchools.includes(school._id) && <CheckCircle size={14} className="text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={testForm.targetSchools.includes(school._id)}
                                                onChange={() => handleSchoolToggle(school._id)}
                                            />
                                            <span className={`text-sm ${testForm.targetSchools.includes(school._id) ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                                                }`}>
                                                {school.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Select schools to assign this test to. Leave empty for all schools.</p>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Number of Questions</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={testForm.questions.length}
                                    onChange={(e) => {
                                        const count = parseInt(e.target.value) || 0;
                                        if (count < 0 || count > 100) return;

                                        const currentQuestions = [...testForm.questions];
                                        if (count > currentQuestions.length) {
                                            // Add more questions
                                            const questionsToAdd = count - currentQuestions.length;
                                            const newQuestions = Array(questionsToAdd).fill().map(() => ({
                                                question: '',
                                                options: ['', '', '', ''],
                                                correctAnswer: 0
                                            }));
                                            setTestForm({
                                                ...testForm,
                                                questions: [...currentQuestions, ...newQuestions]
                                            });
                                        } else if (count < currentQuestions.length) {
                                            // Remove questions from the end
                                            setTestForm({
                                                ...testForm,
                                                questions: currentQuestions.slice(0, count)
                                            });
                                        }
                                    }}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Automatically adds/removes questions below.</p>
                            </div>
                        </div>

                        {/* Phase 3: Advanced Settings */}
                        <div className="bg-black/20 border border-white/5 rounded-xl p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-white">Advanced Settings</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Randomization */}
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 p-3 bg-[#1e293b] border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={testForm.randomizeQuestions}
                                            onChange={e => setTestForm({ ...testForm, randomizeQuestions: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-500 text-primary-500 focus:ring-primary-500"
                                        />
                                        <div>
                                            <span className="block text-sm font-medium text-white">Randomize Questions</span>
                                            <span className="block text-xs text-gray-400">Shuffle question order for each student</span>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 bg-[#1e293b] border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={testForm.randomizeOptions}
                                            onChange={e => setTestForm({ ...testForm, randomizeOptions: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-500 text-primary-500 focus:ring-primary-500"
                                        />
                                        <div>
                                            <span className="block text-sm font-medium text-white">Randomize Options</span>
                                            <span className="block text-xs text-gray-400">Shuffle option order (A, B, C, D)</span>
                                        </div>
                                    </label>
                                </div>

                                {/* Scheduling */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Schedule Publish (Optional)</label>
                                        <input
                                            type="datetime-local"
                                            value={testForm.scheduledPublishAt}
                                            onChange={e => setTestForm({ ...testForm, scheduledPublishAt: e.target.value })}
                                            className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500 text-sm"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Leave empty to publish immediately</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Schedule Close (Optional)</label>
                                        <input
                                            type="datetime-local"
                                            value={testForm.scheduledCloseAt}
                                            onChange={e => setTestForm({ ...testForm, scheduledCloseAt: e.target.value })}
                                            className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500 text-sm"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Test will automatically close at this time</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-xl font-bold">Questions</h3>
                                    <div className="flex items-center bg-black/20 rounded-lg p-1 border border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => setTestLanguage('english')}
                                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${testLanguage === 'english' ? 'bg-primary-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            English
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTestLanguage('hindi')}
                                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${testLanguage === 'hindi' ? 'bg-primary-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            Hindi
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors"
                                >
                                    <Plus size={16} />
                                    Add Question
                                </button>
                            </div>

                            {testForm.questions.map((q, qIndex) => (
                                <div key={qIndex} className="bg-black/20 border border-white/5 rounded-xl p-6 space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <label className="block text-sm text-gray-400 mb-1">
                                                Question {qIndex + 1} ({testLanguage === 'english' ? 'English' : 'Hindi'})
                                            </label>
                                            <textarea
                                                required
                                                value={q.question}
                                                onChange={e => updateQuestion(qIndex, 'question', e.target.value)}
                                                className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500 min-h-[80px]"
                                                placeholder={testLanguage === 'english' ? "Enter question text..." : "प्रश्न दर्ज करें..."}
                                            />
                                        </div>
                                        {testForm.questions.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(qIndex)}
                                                className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors mt-6"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {q.options.map((opt, optIndex) => (
                                            <div key={optIndex} className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuestion(qIndex, 'correctAnswer', optIndex)}
                                                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${q.correctAnswer === optIndex
                                                        ? 'bg-green-500 border-green-500 text-white'
                                                        : 'border-gray-500 text-transparent hover:border-gray-300'
                                                        }`}
                                                >
                                                    <CheckCircle size={14} />
                                                </button>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        required
                                                        value={opt}
                                                        onChange={e => updateOption(qIndex, optIndex, e.target.value)}
                                                        className={`w-full bg-[#1e293b] border rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500 ${q.correctAnswer === optIndex ? 'border-green-500/50' : 'border-white/10'
                                                            }`}
                                                        placeholder={`${testLanguage === 'english' ? 'Option' : 'विकल्प'} ${optIndex + 1}`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-white/10 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl text-gray-400 hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="test-form"
                        disabled={loading}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? 'Creating...' : 'Create Test'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default TestCreationModal;
