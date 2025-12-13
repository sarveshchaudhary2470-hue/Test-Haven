import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, X, Loader, BookOpen, GraduationCap, BarChart, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIGenerationModal = ({ onClose, onGenerate, defaultSubject = '' }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        topic: '',
        subject: defaultSubject || '',
        className: '10',
        difficulty: 'Medium',
        count: 5,
        language: 'English'
    });

    const handleGenerate = async (e) => {
        e.preventDefault();

        if (formData.count < 1) {
            alert("⚠️ Please generate at least 1 question!");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/ai/generate-questions', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                onGenerate(response.data.data);
                onClose();
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to generate questions. Check API Key.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#1e293b] border border-purple-500/30 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>

                <div className="p-6 border-b border-white/10 flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Sparkles className="h-5 w-5 text-purple-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">AI Question Generator</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleGenerate} className="p-6 space-y-5 relative z-10">

                    {/* Topic Input */}
                    <div>
                        <label className="block text-sm font-medium text-purple-300 mb-1">Topic / Chapter</label>
                        <input
                            type="text"
                            required
                            autoFocus
                            value={formData.topic}
                            onChange={e => setFormData({ ...formData, topic: e.target.value })}
                            className="w-full bg-black/20 border border-purple-500/30 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-white placeholder-purple-500/30 transition-all font-medium"
                            placeholder="e.g. Photosynthesis, Newton's Laws..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Subject</label>
                            <div className="relative">
                                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-primary-500 text-white"
                                    placeholder="Subject"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Class</label>
                            <div className="relative">
                                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <select
                                    value={formData.className}
                                    onChange={e => setFormData({ ...formData, className: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-primary-500 text-white appearance-none"
                                >
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i} value={i + 1} className="bg-slate-800">Class {i + 1}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Language Selector */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Language Mode</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['English', 'Hindi', 'Bilingual'].map((lang) => (
                                <button
                                    key={lang}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, language: lang })}
                                    className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all border ${formData.language === lang
                                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/25'
                                        : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/5'
                                        }`}
                                >
                                    {lang === 'Bilingual' ? 'Hinglish' : lang}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Difficulty</label>
                            <div className="relative">
                                <BarChart className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <select
                                    value={formData.difficulty}
                                    onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-primary-500 text-white appearance-none"
                                >
                                    <option value="Easy" className="bg-slate-800">Easy</option>
                                    <option value="Medium" className="bg-slate-800">Medium</option>
                                    <option value="Hard" className="bg-slate-800">Hard</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Count (Max 100)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.count === 0 ? '' : formData.count}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val === '') {
                                        setFormData({ ...formData, count: 0 });
                                    } else {
                                        const num = parseInt(val);
                                        if (num <= 100) { // Only allow if <= 100, checking > 0 on submit
                                            setFormData({ ...formData, count: num });
                                        }
                                    }
                                }}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500 text-white"
                                placeholder="Enter qty"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-white font-bold shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all mt-4"
                    >
                        {loading ? (
                            <>
                                <Loader className="animate-spin h-5 w-5" />
                                <Loader className="animate-spin h-5 w-5" />
                                Generating Magic...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-5 w-5" />
                                Generate Questions
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-500">
                        Powered by TestHaven
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default AIGenerationModal;
