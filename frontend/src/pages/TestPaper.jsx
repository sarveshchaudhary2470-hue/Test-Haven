import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

const TestPaper = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [startTime] = useState(Date.now());

    useEffect(() => {
        fetchTest();
    }, [testId]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && test) {
            handleSubmit();
        }
    }, [timeLeft]);

    const fetchTest = async () => {
        try {
            const { data } = await axios.get(`/api/tests/${testId}`);
            setTest(data);
            setTimeLeft(data.duration * 60);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching test:', error);
            alert('Failed to load test');
            navigate('/dashboard/student');
        }
    };

    const handleAnswerSelect = (questionIndex, optionIndex) => {
        setAnswers({ ...answers, [questionIndex]: optionIndex });
    };

    const handleSubmit = async () => {
        if (submitting) return;

        const unanswered = test.questions.length - Object.keys(answers).length;
        if (unanswered > 0) {
            if (!window.confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
                return;
            }
        }

        setSubmitting(true);
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);

        const formattedAnswers = test.questions.map((_, index) => ({
            selectedAnswer: answers[index] !== undefined ? answers[index] : -1
        }));

        try {
            await axios.post('/api/results', {
                testId: test._id,
                answers: formattedAnswers,
                timeTaken
            });

            alert('Test submitted successfully!');
            navigate('/dashboard/student');
        } catch (error) {
            console.error('Error submitting test:', error);
            alert(error.response?.data?.message || 'Failed to submit test');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 pt-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 mb-8 sticky top-20 z-10"
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white">{test.title}</h1>
                            <p className="text-gray-400 mt-1">{test.subject} - Class {test.class}</p>
                        </div>
                        <div className="text-right">
                            <div className={`flex items-center space-x-2 ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-primary-400'}`}>
                                <Clock className="h-6 w-6" />
                                <span className="text-2xl font-bold font-mono">{formatTime(timeLeft)}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {Object.keys(answers).length}/{test.questions.length} answered
                            </p>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div
                            className="bg-primary-500 h-full transition-all duration-500"
                            style={{ width: `${(Object.keys(answers).length / test.questions.length) * 100}%` }}
                        ></div>
                    </div>
                </motion.div>

                {/* Questions */}
                <div className="space-y-6 mb-8">
                    {test.questions.map((question, qIndex) => (
                        <motion.div
                            key={qIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: qIndex * 0.05 }}
                            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                        >
                            <div className="flex items-start space-x-4 mb-6">
                                <span className="flex-shrink-0 w-8 h-8 bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-full flex items-center justify-center font-semibold text-sm">
                                    {qIndex + 1}
                                </span>
                                <p className="text-lg text-gray-200 flex-1 leading-relaxed">{question.question}</p>
                            </div>

                            <div className="space-y-3 ml-12">
                                {question.options.map((option, oIndex) => (
                                    <label
                                        key={oIndex}
                                        className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 group ${answers[qIndex] === oIndex
                                                ? 'border-primary-500/50 bg-primary-500/10'
                                                : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${answers[qIndex] === oIndex
                                                ? 'border-primary-500'
                                                : 'border-gray-500 group-hover:border-gray-400'
                                            }`}>
                                            {answers[qIndex] === oIndex && (
                                                <div className="w-2.5 h-2.5 bg-primary-500 rounded-full" />
                                            )}
                                        </div>
                                        <input
                                            type="radio"
                                            name={`question-${qIndex}`}
                                            checked={answers[qIndex] === oIndex}
                                            onChange={() => handleAnswerSelect(qIndex, oIndex)}
                                            className="hidden"
                                        />
                                        <span className={`text-base ${answers[qIndex] === oIndex ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                                            }`}>{option}</span>
                                    </label>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Submit Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sticky bottom-6 shadow-2xl"
                >
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full btn-primary py-3 text-lg font-semibold shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting Test...
                            </span>
                        ) : (
                            'Submit Test'
                        )}
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default TestPaper;
