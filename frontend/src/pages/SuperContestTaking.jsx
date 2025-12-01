import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Trophy, Clock, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const SuperContestTaking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contest, setContest] = useState(null);
    const [processedContest, setProcessedContest] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const startTimeRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        fetchContest();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [id]);

    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    const processContestData = (data) => {
        // Create a processed version of questions with original indices
        let processedQuestions = data.questions.map((q, index) => ({
            ...q,
            originalIndex: index,
            processedOptions: q.options.map((opt, i) => ({ text: opt, originalIndex: i }))
        }));

        // Shuffle questions if enabled
        if (data.randomizeQuestions) {
            processedQuestions = shuffleArray(processedQuestions);
        }

        // Shuffle options if enabled
        if (data.randomizeOptions) {
            processedQuestions = processedQuestions.map(q => ({
                ...q,
                processedOptions: shuffleArray(q.processedOptions)
            }));
        }

        return { ...data, questions: processedQuestions };
    };

    const fetchContest = async () => {
        try {
            // Set a timeout of 30 seconds
            const config = { timeout: 30000 };

            const response = await axios.get(`http://localhost:5000/api/super-contests/${id}`, config);
            const contestData = response.data.data;

            setContest(contestData);
            setProcessedContest(processContestData(contestData));
            setAnswers(new Array(contestData.questions.length).fill(-1));

            // Calculate time left
            const now = new Date();
            const end = new Date(contestData.endTime);
            const duration = contestData.duration * 60 * 1000; // Convert to milliseconds
            const timeRemaining = Math.min(end - now, duration);

            setTimeLeft(timeRemaining);

            // Start the contest on server
            try {
                const startResponse = await axios.post(`http://localhost:5000/api/super-contests/${id}/start`, {}, config);
                const { startedAt, status, answers: savedAnswers } = startResponse.data.data;

                // If already submitted, redirect
                if (status === 'submitted') {
                    alert('You have already submitted this contest');
                    navigate('/dashboard');
                    return;
                }

                // Restore answers if available
                if (savedAnswers && savedAnswers.length > 0) {
                    setAnswers(savedAnswers);
                } else {
                    // Try to restore from localStorage as backup
                    const localAnswers = localStorage.getItem(`contest_answers_${id}`);
                    if (localAnswers) {
                        setAnswers(JSON.parse(localAnswers));
                    }
                }

                // Adjust local timer based on server start time
                if (startedAt) {
                    const serverStartTime = new Date(startedAt).getTime();
                    startTimeRef.current = serverStartTime;

                    // Recalculate time left based on server start time
                    const elapsed = Date.now() - serverStartTime;
                    const totalDuration = contestData.duration * 60 * 1000;
                    const remaining = Math.max(0, totalDuration - elapsed);

                    // Also respect the absolute end time
                    const absoluteEnd = new Date(contestData.endTime).getTime();
                    const absoluteRemaining = Math.max(0, absoluteEnd - Date.now());

                    setTimeLeft(Math.min(remaining, absoluteRemaining));
                } else {
                    startTimeRef.current = Date.now();
                }

            } catch (err) {
                console.error('Error starting contest session:', err);
                // Alert and redirect on ANY error
                alert(err.response?.data?.message || 'Failed to start contest session. Please try again.');
                navigate('/dashboard');
                return;
            }

            // Start timer
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 0) {
                        handleAutoSubmit();
                        return 0;
                    }
                    return prev - 10; // Update every 10ms for smooth countdown
                });
            }, 10);

        } catch (error) {
            console.error('Error fetching contest:', error);
            alert('Failed to load contest: ' + (error.message || 'Unknown error'));
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (optionOriginalIndex) => {
        const currentQ = processedContest.questions[currentQuestion];
        const newAnswers = [...answers];
        newAnswers[currentQ.originalIndex] = optionOriginalIndex;
        setAnswers(newAnswers);

        // Save to localStorage immediately
        localStorage.setItem(`contest_answers_${id}`, JSON.stringify(newAnswers));
    };

    const handleSubmit = async () => {
        if (!window.confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
            return;
        }

        setSubmitting(true);
        if (timerRef.current) clearInterval(timerRef.current);

        const timeTaken = Date.now() - startTimeRef.current;

        try {
            await axios.post(`http://localhost:5000/api/super-contests/${id}/submit`, {
                answers,
                timeTaken,
                startedAt: new Date(startTimeRef.current)
            });

            // Clear localStorage on successful submit
            localStorage.removeItem(`contest_answers_${id}`);

            alert('🎉 Contest submitted successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error submitting contest:', error);
            alert('Failed to submit: ' + (error.response?.data?.message || error.message));
            setSubmitting(false);
        }
    };

    const handleAutoSubmit = async () => {
        if (submitting) return;

        setSubmitting(true);
        if (timerRef.current) clearInterval(timerRef.current);

        const timeTaken = Date.now() - startTimeRef.current;

        try {
            await axios.post(`http://localhost:5000/api/super-contests/${id}/submit`, {
                answers,
                timeTaken,
                startedAt: new Date(startTimeRef.current)
            });

            // Clear localStorage
            localStorage.removeItem(`contest_answers_${id}`);

            alert('⏰ Time is up! Your contest has been auto-submitted.');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error auto-submitting contest:', error);
            navigate('/dashboard');
        }
    };

    const formatTime = (ms) => {
        if (isNaN(ms) || ms < 0) return "00:00.00";
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((ms % 1000) / 10); // Show centiseconds
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    };

    const getProgressPercentage = () => {
        if (!contest) return 0;
        const totalTime = contest.duration * 60 * 1000;
        return ((totalTime - timeLeft) / totalTime) * 100;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    if (!processedContest) return null;

    const question = processedContest.questions[currentQuestion];
    const answeredCount = answers.filter(a => a !== -1).length;
    const currentAnswer = answers[question.originalIndex];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 pt-24">
            <div className="max-w-5xl mx-auto">
                {/* Header with Timer */}
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
                                <Trophy className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{contest.title}</h1>
                                <p className="text-gray-400 text-sm">{contest.subject}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-3xl font-mono font-bold ${timeLeft < 60000 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                                {formatTime(timeLeft)}
                            </div>
                            <p className="text-gray-400 text-sm">Time Remaining</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-500 to-orange-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${getProgressPercentage()}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-6">
                    {/* Question Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-2 bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 rounded-lg font-semibold">
                                Question {currentQuestion + 1} of {contest.questions.length}
                            </span>
                            <span className="px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-lg font-semibold">
                                {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
                            </span>
                        </div>
                        <span className="text-gray-400 text-sm">
                            {answeredCount}/{contest.questions.length} Answered
                        </span>
                    </div>

                    {/* Question Text */}
                    <h2 className="text-xl font-semibold text-white mb-8 leading-relaxed">
                        {question.question}
                    </h2>

                    {/* Options */}
                    <div className="space-y-4">
                        {question.processedOptions.map((option, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAnswerSelect(option.originalIndex)}
                                className={`w-full p-5 rounded-xl border-2 text-left transition-all ${currentAnswer === option.originalIndex
                                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500 shadow-lg shadow-yellow-500/20'
                                    : 'bg-white/5 border-white/10 hover:border-white/30'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${currentAnswer === option.originalIndex
                                        ? 'bg-yellow-500 border-yellow-500 text-white'
                                        : 'border-gray-400 text-gray-400'
                                        }`}>
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <span className={`text-lg ${currentAnswer === option.originalIndex ? 'text-white font-semibold' : 'text-gray-300'
                                        }`}>
                                        {option.text}
                                    </span>
                                    {currentAnswer === option.originalIndex && (
                                        <CheckCircle className="h-6 w-6 text-yellow-400 ml-auto" />
                                    )}
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestion === 0}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        Previous
                    </button>

                    {/* Question Numbers */}
                    <div className="flex gap-2 overflow-x-auto max-w-2xl">
                        {processedContest.questions.map((q, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentQuestion(index)}
                                className={`w-10 h-10 rounded-lg font-semibold transition-all flex-shrink-0 ${currentQuestion === index
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                                    : answers[q.originalIndex] !== -1
                                        ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                                        : 'bg-white/5 text-gray-400 border border-white/10'
                                    }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    {currentQuestion === processedContest.questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {submitting ? 'Submitting...' : 'Submit Contest'}
                            <CheckCircle className="h-5 w-5" />
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestion(prev => Math.min(processedContest.questions.length - 1, prev + 1))}
                            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center gap-2"
                        >
                            Next
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Warning if time is low */}
                {timeLeft < 60000 && timeLeft > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 bg-red-500/20 border border-red-500/40 rounded-xl p-4 flex items-center gap-3"
                    >
                        <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
                        <p className="text-red-300 font-semibold">
                            Less than 1 minute remaining! Your contest will be auto-submitted when time runs out.
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default SuperContestTaking;
