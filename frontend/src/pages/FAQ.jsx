import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: 'What is TestHaven?',
            answer: 'TestHaven is a comprehensive school management and online MCQ testing platform designed to streamline educational assessment and performance tracking for schools of all sizes.'
        },
        {
            question: 'How do I get access to the platform?',
            answer: 'Access is provided directly by your educational institution. Please contact your school administration to receive your secure login credentials.'
        },
        {
            question: 'Is the platform accessible on mobile devices?',
            answer: 'Yes, TestHaven features a fully responsive design that works seamlessly on desktops, tablets, and smartphones, allowing you to access the platform from anywhere.'
        },
        {
            question: 'What kind of performance analytics are available?',
            answer: 'We provide detailed insights including subject-wise performance breakdowns, time management analysis, and historical progress tracking to help improve learning outcomes.'
        },
        {
            question: 'How secure is the data on TestHaven?',
            answer: 'We prioritize data security with industry-standard encryption and secure authentication protocols to ensure that all student and school data remains private and protected.'
        },
        {
            question: 'What happens if I lose internet connection during a test?',
            answer: 'Our platform is designed with resilience in mind. Your progress is automatically saved, allowing you to resume exactly where you left off once connectivity is restored.'
        },
        {
            question: 'Can I review my test answers after submission?',
            answer: 'Yes, detailed solutions and explanations are available immediately after the test is submitted, helping students understand their mistakes and learn effectively.'
        },
        {
            question: 'Does the platform support different types of questions?',
            answer: 'TestHaven specializes in Multiple Choice Questions (MCQs) with support for various difficulty levels and subject categories to create comprehensive assessments.'
        },
        {
            question: 'How can schools benefit from using TestHaven?',
            answer: 'Schools can automate their grading process, reduce administrative paperwork, and gain valuable insights into academic performance, allowing teachers to focus more on teaching.'
        },
        {
            question: 'Is technical support available?',
            answer: 'Yes, our dedicated support team is available to assist with any technical issues or queries to ensure a smooth experience for all users.'
        }
    ];

    return (
        <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900">
            <section className="py-20 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-5xl font-bold text-white mb-6">Frequently Asked Questions</h1>
                        <p className="text-xl text-gray-300">Find answers to common questions about TestHaven</p>
                    </motion.div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:bg-white/10 ${openIndex === index ? 'border-primary-500/30 bg-white/10' : ''}`}
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            >
                                <div className="p-6 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-white pr-8">{faq.question}</h3>
                                    {openIndex === index ? (
                                        <ChevronUp className="h-6 w-6 text-primary-400 flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="h-6 w-6 text-gray-400 flex-shrink-0" />
                                    )}
                                </div>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="px-6 pb-6 text-gray-300"
                                    >
                                        {faq.answer}
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FAQ;
