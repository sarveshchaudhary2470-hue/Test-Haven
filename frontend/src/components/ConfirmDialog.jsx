import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) => {
    if (!isOpen) return null;

    const colors = {
        warning: {
            bg: 'from-yellow-500/20 to-amber-500/20',
            border: 'border-yellow-500/30',
            icon: 'text-yellow-400',
            button: 'from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600'
        },
        danger: {
            bg: 'from-red-500/20 to-rose-500/20',
            border: 'border-red-500/30',
            icon: 'text-red-400',
            button: 'from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
        },
        info: {
            bg: 'from-blue-500/20 to-cyan-500/20',
            border: 'border-blue-500/30',
            icon: 'text-blue-400',
            button: 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
        }
    };

    const colorScheme = colors[type] || colors.warning;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#1e293b] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-3 bg-gradient-to-br ${colorScheme.bg} border ${colorScheme.border} rounded-xl`}>
                            <AlertCircle className={`h-8 w-8 ${colorScheme.icon}`} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white">{title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <p className="text-gray-300 mb-6 leading-relaxed">{message}</p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-4 py-3 bg-gradient-to-r ${colorScheme.button} rounded-xl text-white font-bold transition-all shadow-lg`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmDialog;
