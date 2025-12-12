import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, AlertCircle,
    Languages, X, Check, FileText, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from '../utils/toast';

const TestTaking = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [language, setLanguage] = useState('english'); // 'english' or 'hindi'
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());

    useEffect(() => {
        fetchTest();
    }, [testId]);

    useEffect(() => {
        if (timeRemaining > 0 && !submitting) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeRemaining === 0 && !submitting && test) {
            handleAutoSubmit();
        }
    }, [timeRemaining, submitting, test]);

    const fetchTest = async () => {
        try {
            const token = localStorage.getItem('token');

            // 1. Check if already submitted
            try {
                const resultResponse = await axios.get(`/api/results/test/${testId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (resultResponse.data) {
                    alert('You have already submitted this test.');
                    navigate('/dashboard');
                    return;
                }
            } catch (err) {
                // If 404, it means not submitted yet, which is good.
                if (err.response && err.response.status !== 404) {
                    console.error('Error checking result status:', err);
                }
            }

            // 2. Fetch Test Data
            const response = await axios.get(`/api/tests/${testId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTest(response.data);
            setTimeRemaining(response.data.duration * 60); // Convert minutes to seconds

            // 3. Restore answers from localStorage
            const savedAnswers = localStorage.getItem(`test_answers_${testId}`);
            if (savedAnswers) {
                setAnswers(JSON.parse(savedAnswers));
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching test:', error);
            toast.error('Failed to load test');
            navigate('/dashboard');
        }
    };

    const handleAnswerSelect = (questionIndex, optionIndex) => {
        const newAnswers = {
            ...answers,
            [questionIndex]: optionIndex
        };
        setAnswers(newAnswers);
        localStorage.setItem(`test_answers_${testId}`, JSON.stringify(newAnswers));
    };

    const toggleFlag = (questionIndex) => {
        const newFlagged = new Set(flaggedQuestions);
        if (newFlagged.has(questionIndex)) {
            newFlagged.delete(questionIndex);
        } else {
            newFlagged.add(questionIndex);
        }
        setFlaggedQuestions(newFlagged);
    };

    const handleAutoSubmit = async () => {
        await handleSubmit(true);
    };

    const handleSubmit = async (autoSubmit = false) => {
        if (!autoSubmit && !showSubmitConfirm) {
            setShowSubmitConfirm(true);
            return;
        }

        setSubmitting(true);
        const loadingToast = toast.loading('Submitting test...');

        try {
            const token = localStorage.getItem('token');

            // Calculate score
            let score = 0;
            const responses = test.questions.map((q, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === q.correctAnswer;
                if (isCorrect) {
                    score += test.totalMarks / test.questions.length;
                }
                return {
                    question: q._id || index,
                    selectedAnswer: userAnswer !== undefined ? userAnswer : -1,
                    isCorrect
                };
            });

            const percentage = (score / test.totalMarks) * 100;

            await axios.post('/api/results', {
                testId: testId, // Fixed: Changed 'test' to 'testId' to match backend expectation
                answers: responses, // Fixed: Backend expects 'answers', not 'responses'
                timeTaken: (test.duration * 60) - timeRemaining
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Clear localStorage
            localStorage.removeItem(`test_answers_${testId}`);

            toast.dismiss(loadingToast);
            toast.success(autoSubmit
                ? '⏰ Time up! Test submitted automatically.'
                : '✅ Test submitted successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error submitting test:', error);
            toast.dismiss(loadingToast);
            toast.error('❌ Failed to submit test');
            setSubmitting(false);
            setShowSubmitConfirm(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getQuestionStatus = (index) => {
        if (answers[index] !== undefined) return 'answered';
        if (flaggedQuestions.has(index)) return 'flagged';
        return 'unanswered';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary-500/20 border-t-primary-500"></div>
            </div>
        );
    }

    if (!test.questions || test.questions.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900 pt-24 flex items-center justify-center">
                <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10">
                    <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">No Questions Found</h2>
                    <p className="text-gray-400 mb-6">This test does not contain any questions.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-2 bg-primary-500 hover:bg-primary-600 rounded-xl text-white transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const question = test.questions[currentQuestion];
    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / test.questions.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900 pt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-white mb-2">{test.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                    <FileText className="h-4 w-4" />
                                    {test.subject}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Award className="h-4 w-4" />
                                    {test.totalMarks} Marks
                                </span>
                                <span>
                                    Question {currentQuestion + 1} of {test.questions.length}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Language Toggle */}
                            <button
                                onClick={() => setLanguage(language === 'english' ? 'hindi' : 'english')}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-colors"
                            >
                                <Languages className="h-5 w-5" />
                                {language === 'english' ? 'हिंदी' : 'English'}
                            </button>

                            {/* Timer */}
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${timeRemaining < 300
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                : 'bg-primary-500/20 text-primary-300 border border-primary-500/40'
                                }`}>
                                <Clock className="h-5 w-5" />
                                {formatTime(timeRemaining)}
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                            <span>Progress: {answeredCount}/{test.questions.length} answered</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-primary-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Question Panel */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentQuestion}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
                            >
                                {/* Question Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-white">
                                        Question {currentQuestion + 1}
                                    </h2>
                                    <button
                                        onClick={() => toggleFlag(currentQuestion)}
                                        className={`p-2 rounded-lg transition-colors ${flaggedQuestions.has(currentQuestion)
                                            ? 'bg-yellow-500/20 text-yellow-300'
                                            : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                            }`}
                                    >
                                        <Flag className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Question Text */}
                                <div className="mb-8">
                                    <p className="text-lg text-white leading-relaxed">
                                        {language === 'hindi' && question.questionTextHindi
                                            ? question.questionTextHindi
                                            : question.question}
                                    </p>
                                </div>

                                {/* Options */}
                                <div className="space-y-4">
                                    {question.options.map((option, index) => {
                                        const isSelected = answers[currentQuestion] === index;
                                        const optionText = language === 'hindi' && question.optionsHindi?.[index]
                                            ? question.optionsHindi[index]
                                            : option;

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleAnswerSelect(currentQuestion, index)}
                                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isSelected
                                                    ? 'bg-primary-500/20 border-primary-500 text-white'
                                                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected
                                                        ? 'border-primary-500 bg-primary-500'
                                                        : 'border-gray-500'
                                                        }`}>
                                                        {isSelected && <Check className="h-4 w-4 text-white" />}
                                                    </div>
                                                    <span className="flex-1">{optionText}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Navigation */}
                                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                                    <button
                                        onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                                        disabled={currentQuestion === 0}
                                        className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 rounded-xl text-white font-medium transition-colors"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                        Previous
                                    </button>

                                    {currentQuestion === test.questions.length - 1 ? (
                                        <button
                                            onClick={() => handleSubmit()}
                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl text-white font-bold transition-all shadow-lg"
                                        >
                                            <CheckCircle className="h-5 w-5" />
                                            Submit Test
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setCurrentQuestion(Math.min(test.questions.length - 1, currentQuestion + 1))}
                                            className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl text-white font-medium transition-colors"
                                        >
                                            Next
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Question Navigator */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-white mb-4">Questions</h3>

                            {/* Legend */}
                            <div className="space-y-2 mb-4 text-xs">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <div className="w-4 h-4 rounded bg-primary-500/20 border border-primary-500"></div>
                                    <span>Answered</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500"></div>
                                    <span>Flagged</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <div className="w-4 h-4 rounded bg-white/5 border border-white/20"></div>
                                    <span>Not Answered</span>
                                </div>
                            </div>

                            {/* Question Grid */}
                            <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto custom-scrollbar">
                                {test.questions.map((_, index) => {
                                    const status = getQuestionStatus(index);
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentQuestion(index)}
                                            className={`aspect-square rounded-lg font-semibold text-sm transition-all ${currentQuestion === index
                                                ? 'ring-2 ring-white scale-110'
                                                : ''
                                                } ${status === 'answered'
                                                    ? 'bg-primary-500/20 border border-primary-500 text-primary-300'
                                                    : status === 'flagged'
                                                        ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-300'
                                                        : 'bg-white/5 border border-white/20 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Confirmation Modal */}
            <AnimatePresence>
                {showSubmitConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1e293b] border border-white/10 rounded-2xl p-8 max-w-md w-full"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-yellow-500/20 rounded-xl">
                                    <AlertCircle className="h-8 w-8 text-yellow-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Submit Test?</h3>
                                    <p className="text-gray-400 text-sm">This action cannot be undone</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6 text-sm">
                                <div className="flex justify-between text-gray-300">
                                    <span>Total Questions:</span>
                                    <span className="font-semibold">{test.questions.length}</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Answered:</span>
                                    <span className="font-semibold text-green-400">{answeredCount}</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Unanswered:</span>
                                    <span className="font-semibold text-red-400">{test.questions.length - answeredCount}</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Time Remaining:</span>
                                    <span className="font-semibold">{formatTime(timeRemaining)}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSubmitConfirm(false)}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleSubmit(false)}
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl text-white font-bold transition-all disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TestTaking;
