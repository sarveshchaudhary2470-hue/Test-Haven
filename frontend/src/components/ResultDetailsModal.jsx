import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, Clock, Award } from 'lucide-react';

const ResultDetailsModal = ({ result, onClose }) => {
    if (!result) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#1e293b] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600/20 to-blue-600/20 p-6 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">{result.test.title}</h2>
                                <div className="flex items-center gap-4 text-sm text-gray-300">
                                    <span className="flex items-center gap-1">
                                        <Award className="h-4 w-4" />
                                        {result.test.subject}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {new Date(result.submittedAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Score Summary */}
                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="bg-white/5 rounded-xl p-4 text-center">
                                <p className="text-gray-400 text-xs mb-1">Score</p>
                                <p className="text-2xl font-bold text-white">{result.score}/{result.test.totalMarks}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 text-center">
                                <p className="text-gray-400 text-xs mb-1">Percentage</p>
                                <p className={`text-2xl font-bold ${result.percentage >= 75 ? 'text-green-400' :
                                        result.percentage >= 50 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>{result.percentage}%</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 text-center">
                                <p className="text-gray-400 text-xs mb-1">Correct</p>
                                <p className="text-2xl font-bold text-white">{result.correctAnswers}/{result.totalQuestions}</p>
                            </div>
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)] custom-scrollbar">
                        <h3 className="text-lg font-bold text-white mb-4">Question-wise Analysis</h3>
                        <div className="space-y-4">
                            {result.test.questions.map((question, index) => {
                                const answer = result.answers[index];
                                const isCorrect = answer?.isCorrect;

                                return (
                                    <div
                                        key={index}
                                        className={`bg-white/5 border rounded-xl p-5 ${isCorrect
                                                ? 'border-green-500/30'
                                                : 'border-red-500/30'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className={`p-2 rounded-lg ${isCorrect
                                                    ? 'bg-green-500/20'
                                                    : 'bg-red-500/20'
                                                }`}>
                                                {isCorrect ? (
                                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-white font-semibold mb-2">
                                                    Question {index + 1}
                                                </h4>
                                                <p className="text-gray-300 mb-3">{question.question}</p>

                                                {/* Options */}
                                                <div className="space-y-2">
                                                    {question.options.map((option, optIndex) => {
                                                        const isUserAnswer = answer?.selectedAnswer === optIndex;
                                                        const isCorrectAnswer = question.correctAnswer === optIndex;

                                                        return (
                                                            <div
                                                                key={optIndex}
                                                                className={`p-3 rounded-lg border ${isCorrectAnswer
                                                                        ? 'bg-green-500/10 border-green-500/40 text-green-300'
                                                                        : isUserAnswer
                                                                            ? 'bg-red-500/10 border-red-500/40 text-red-300'
                                                                            : 'bg-white/5 border-white/10 text-gray-400'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium">
                                                                        {String.fromCharCode(65 + optIndex)}.
                                                                    </span>
                                                                    <span>{option}</span>
                                                                    {isCorrectAnswer && (
                                                                        <span className="ml-auto text-xs font-semibold">
                                                                            ✓ Correct Answer
                                                                        </span>
                                                                    )}
                                                                    {isUserAnswer && !isCorrectAnswer && (
                                                                        <span className="ml-auto text-xs font-semibold">
                                                                            ✗ Your Answer
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ResultDetailsModal;
