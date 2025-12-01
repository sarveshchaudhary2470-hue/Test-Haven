import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Award, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

const Home = () => {
    const features = [
        {
            icon: <BookOpen className="h-12 w-12 text-primary-600" />,
            title: 'Online MCQ Tests',
            description: 'Conduct comprehensive MCQ tests for classes 1-12 with automated grading and instant results.'
        },
        {
            icon: <Users className="h-12 w-12 text-primary-600" />,
            title: 'Multi-School Management',
            description: 'Manage multiple schools from a single admin panel with role-based access control.'
        },
        {
            icon: <Award className="h-12 w-12 text-primary-600" />,
            title: 'Detailed Analytics',
            description: 'Get comprehensive insights with class-wise performance reports and downloadable results.'
        },
        {
            icon: <TrendingUp className="h-12 w-12 text-primary-600" />,
            title: 'Real-time Tracking',
            description: 'Track student progress in real-time with detailed answer analysis and performance metrics.'
        }
    ];

    const benefits = [
        'Secure role-based access for Students',
        'Automated test grading with instant feedback',
        'Class-wise and school-wise result management',
        'Downloadable reports for principals',
        'Student suspension and account management',
        'Mobile-responsive design for all devices'
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900">
            {/* Hero Section */}
            <section className="relative pt-24 pb-20 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                                Transform Education with{' '}
                                <span className="bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent font-extrabold">TestHaven</span>
                            </h1>
                            <p className="text-xl text-gray-300 mb-8">
                                A comprehensive school management and online testing platform designed for modern education.
                                Conduct MCQ tests, manage multiple schools, and track student performance effortlessly.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/login" className="btn-primary inline-flex items-center justify-center">
                                    Get Started
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <Link
                                    to="/about"
                                    className="px-6 py-3 border-2 border-primary-400 text-primary-300 rounded-lg font-medium hover:bg-primary-500/10 transition-all duration-300 backdrop-blur-sm"
                                >
                                    Learn More
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-600 rounded-2xl p-1 shadow-2xl shadow-primary-500/20">
                                <div className="bg-gray-900/90 backdrop-blur-xl rounded-xl p-6 space-y-4 border border-white/10">
                                    <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30">
                                            <BookOpen className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-300">Active Tests</p>
                                            <p className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">150+</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                        <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center shadow-lg shadow-secondary-500/30">
                                            <Users className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-300">Students Enrolled</p>
                                            <p className="text-3xl font-bold bg-gradient-to-r from-secondary-400 to-secondary-300 bg-clip-text text-transparent">5000+</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                        <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center shadow-lg shadow-success-500/30">
                                            <Award className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-200">Schools Connected</p>
                                            <p className="text-3xl font-bold text-success-300">25+</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white/5 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/5 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Powerful Features for Modern Education
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Everything you need to manage schools, conduct tests, and track student performance in one platform.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:scale-105 hover:bg-white/10 hover:border-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300"
                            >
                                <div className="flex justify-center mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-gray-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900"></div>
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full filter blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-600/10 rounded-full filter blur-3xl opacity-30"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl font-bold text-white mb-6">
                                Why Choose TestHaven?
                            </h2>
                            <p className="text-lg text-gray-300 mb-8">
                                Our platform is designed to streamline educational management and testing with cutting-edge features.
                            </p>
                            <div className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-start space-x-3"
                                    >
                                        <CheckCircle className="h-6 w-6 text-success-400 flex-shrink-0 mt-1" />
                                        <p className="text-gray-300 text-lg">{benefit}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
                                <h3 className="text-2xl font-bold text-white mb-6">Key Platform Features</h3>
                                <div className="space-y-6">
                                    <div className="border-l-4 border-primary-500 pl-4 bg-white/5 p-4 rounded-r-lg hover:bg-white/10 transition-colors">
                                        <h4 className="font-semibold text-lg text-primary-300 mb-2">Advanced Analytics</h4>
                                        <p className="text-gray-400">Comprehensive data visualization with real-time insights, performance metrics, and customizable reporting tools for informed decision-making.</p>
                                    </div>
                                    <div className="border-l-4 border-secondary-500 pl-4 bg-white/5 p-4 rounded-r-lg hover:bg-white/10 transition-colors">
                                        <h4 className="font-semibold text-lg text-secondary-300 mb-2">Smart Test Management</h4>
                                        <p className="text-gray-400">Intelligent test creation, automated grading, instant feedback delivery, and detailed performance analysis with question-level insights.</p>
                                    </div>
                                    <div className="border-l-4 border-success-500 pl-4 bg-white/5 p-4 rounded-r-lg hover:bg-white/10 transition-colors">
                                        <h4 className="font-semibold text-lg text-success-300 mb-2">Seamless User Experience</h4>
                                        <p className="text-gray-400">Intuitive interface design with responsive layouts, quick navigation, personalized dashboards, and accessibility features for all users.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-20 bg-gradient-to-r from-slate-800 to-zinc-900 overflow-hidden border-t border-white/10">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-900/20 to-transparent"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-900/20 rounded-full filter blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Ready to Transform Your School Management?
                        </h2>
                        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                            Join hundreds of schools already using TestHaven to streamline their testing and management processes.
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105"
                        >
                            Get Started Today
                            <ArrowRight className="ml-2 h-6 w-6" />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
