import React, { useState } from 'react';
import axios from 'axios';
import { X, Plus, Trash2, CheckCircle, Languages, Upload, Download, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadTemplate, parseQuestionsFromExcel } from '../utils/excelUtils';
import AIGenerationModal from './AIGenerationModal';

const TestCreationModal = ({ onClose, onSuccess, user, schools }) => {
    const [loading, setLoading] = useState(false);
    const [testLanguage, setTestLanguage] = useState('english'); // 'english' or 'hindi'
    const [showAIModal, setShowAIModal] = useState(false);

    // Initial Form State
    const [testForm, setTestForm] = useState({
        title: '',
        subject: '',
        class: '',
        duration: 30,
        totalMarks: 100,
        schools: [],
        scheduledPublishAt: '',
        scheduledCloseAt: '',
        randomizeQuestions: false,
        randomizeOptions: false,
        questions: [{
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0
        }]
    });

    const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

    const handleSchoolSelection = (e) => {
        const selectedId = e.target.value;
        setTestForm({ ...testForm, schools: selectedId ? [selectedId] : [] });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const parsedQuestions = await parseQuestionsFromExcel(file);
            setTestForm(prev => {
                const isDefault = prev.questions.length === 1 && !prev.questions[0].question && prev.questions[0].options.every(opt => opt === '');
                return {
                    ...prev,
                    questions: isDefault ? parsedQuestions : [...prev.questions, ...parsedQuestions]
                };
            });
            alert(`✅ Successfully added ${parsedQuestions.length} questions from Excel!`);
        } catch (error) {
            console.error(error);
            alert(`❌ Error parsing Excel: ${error.message}`);
        } finally {
            e.target.value = '';
        }
    };

    const handleAIGeneratedQuestions = (generatedQuestions) => {
        setTestForm(prev => {
            const isDefault = prev.questions.length === 1 && !prev.questions[0].question && prev.questions[0].options.every(opt => opt === '');
            return {
                ...prev,
                questions: isDefault ? generatedQuestions : [...prev.questions, ...generatedQuestions]
            };
        });
        alert(`✨ AI successfully generated ${generatedQuestions.length} questions!`);
    };

    const addQuestion = () => {
        setTestForm(prev => ({
            ...prev,
            questions: [...prev.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
        }));
    };

    const removeQuestion = (index) => {
        if (testForm.questions.length > 1) {
            setTestForm(prev => ({
                ...prev,
                questions: prev.questions.filter((_, i) => i !== index)
            }));
        }
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...testForm.questions];
        newQuestions[index][field] = value;
        setTestForm(prev => ({ ...prev, questions: newQuestions }));
    };

    const updateOption = (qIndex, optIndex, value) => {
        const newQuestions = [...testForm.questions];
        newQuestions[qIndex].options[optIndex] = value;
        setTestForm(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (testForm.questions.some(q => !q.question || q.options.some(opt => !opt))) {
            alert('Please fill in all questions and options');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const payload = {
                ...testForm,
                scheduledPublishAt: testForm.scheduledPublishAt ? new Date(testForm.scheduledPublishAt).toISOString() : null,
                scheduledCloseAt: testForm.scheduledCloseAt ? new Date(testForm.scheduledCloseAt).toISOString() : null
            };

            await axios.post('/api/tests', payload, config);
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to create test');
        } finally {
            setLoading(false);
        }
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
                    <h2 className="text-2xl font-bold text-white">Create New Test</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="test-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* School Selection for Admin/Manager */}
                            {isAdminOrManager && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-400 mb-1">Target School <span className="text-primary-400 text-xs ml-2">(Admin Only)</span></label>
                                    <select
                                        value={testForm.schools[0] || ""}
                                        onChange={handleSchoolSelection}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500 text-white"
                                    >
                                        <option value="">Select a School (or Assign to All)</option>
                                        {schools?.map(school => (
                                            <option key={school._id} value={school._id}>
                                                {school.name} ({school.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="md:col-span-2">
                                <label className="block text-sm text-gray-400 mb-1">Test Title</label>
                                <input
                                    type="text"
                                    required
                                    value={testForm.title}
                                    onChange={e => setTestForm({ ...testForm, title: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500 text-white"
                                    placeholder="e.g. Weekly Math Quiz"
                                />
                            </div>

                            {/* Subject, Class, Duration, Total Marks inputs */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Subject</label>
                                <input type="text" required value={testForm.subject} onChange={e => setTestForm({ ...testForm, subject: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Class</label>
                                <select value={testForm.class} onChange={e => setTestForm({ ...testForm, class: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white">
                                    <option value="">Select Class</option>
                                    {[...Array(12)].map((_, i) => <option key={i} value={i + 1}>Class {i + 1}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Duration (mins)</label>
                                <input type="number" required value={testForm.duration} onChange={e => setTestForm({ ...testForm, duration: parseInt(e.target.value) })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Total Marks</label>
                                <input type="number" required value={testForm.totalMarks} onChange={e => setTestForm({ ...testForm, totalMarks: parseInt(e.target.value) })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white" />
                            </div>

                            {/* Schedule & Randomization */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Schedule Publish</label>
                                <input type="datetime-local" value={testForm.scheduledPublishAt} onChange={e => setTestForm({ ...testForm, scheduledPublishAt: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Schedule Close</label>
                                <input type="datetime-local" value={testForm.scheduledCloseAt} onChange={e => setTestForm({ ...testForm, scheduledCloseAt: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white" />
                            </div>

                            <div className="md:col-span-2 flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={testForm.randomizeQuestions} onChange={e => setTestForm({ ...testForm, randomizeQuestions: e.target.checked })} className="rounded bg-black/20 border-white/10" />
                                    <span className="text-sm text-gray-300">Randomize Questions</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={testForm.randomizeOptions} onChange={e => setTestForm({ ...testForm, randomizeOptions: e.target.checked })} className="rounded bg-black/20 border-white/10" />
                                    <span className="text-sm text-gray-300">Randomize Options</span>
                                </label>
                            </div>
                        </div>

                        {/* Questions Header */}
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-white/10 pb-4">
                                <h3 className="text-xl font-bold text-white">Questions</h3>
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={() => setShowAIModal(true)} className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors border border-purple-500/40 hover:border-purple-500/60">
                                        <Sparkles size={16} /> Generate with AI
                                    </button>
                                    <button type="button" onClick={downloadTemplate} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm px-3 py-2 border border-white/10 rounded-lg">
                                        <Download size={16} /> Template
                                    </button>
                                    <label className="cursor-pointer bg-green-500/10 text-green-400 hover:bg-green-500/20 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors border border-green-500/20 hover:border-green-500/40">
                                        <Upload size={16} /> Upload Excel
                                        <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                    <button type="button" onClick={addQuestion} className="bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors border border-primary-500/20">
                                        <Plus size={16} /> Add Question
                                    </button>
                                </div>
                            </div>

                            {/* Questions List */}
                            <div className="space-y-4">
                                {testForm.questions.map((q, qIndex) => (
                                    <div key={qIndex} className="bg-black/20 border border-white/5 rounded-xl p-6 space-y-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <label className="block text-sm text-gray-400 mb-1">Question {qIndex + 1}</label>
                                                <textarea required value={q.question} onChange={e => updateQuestion(qIndex, 'question', e.target.value)} className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500 min-h-[80px]" placeholder="Enter question..." />
                                            </div>
                                            <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-400 p-2"><Trash2 size={20} /></button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.options.map((opt, optIndex) => (
                                                <div key={optIndex} className="flex items-center gap-3">
                                                    <button type="button" onClick={() => updateQuestion(qIndex, 'correctAnswer', optIndex)} className={`w-6 h-6 rounded-full border flex items-center justify-center ${q.correctAnswer === optIndex ? 'bg-green-500 border-green-500 text-white' : 'border-gray-500'}`}><CheckCircle size={14} /></button>
                                                    <input type="text" required value={opt} onChange={e => updateOption(qIndex, optIndex, e.target.value)} className={`w-full bg-[#1e293b] border rounded-xl px-4 py-2 ${q.correctAnswer === optIndex ? 'border-green-500/50' : 'border-white/10'}`} placeholder={`Option ${optIndex + 1}`} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-white/10 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl text-gray-400 hover:bg-white/5">Cancel</button>
                    <button type="submit" form="test-form" disabled={loading} className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl font-medium">{loading ? 'Creating...' : 'Create Test'}</button>
                </div>
            </motion.div>

            <AnimatePresence>
                {showAIModal && (
                    <AIGenerationModal onClose={() => setShowAIModal(false)} onGenerate={handleAIGeneratedQuestions} defaultSubject={testForm.subject} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default TestCreationModal;
