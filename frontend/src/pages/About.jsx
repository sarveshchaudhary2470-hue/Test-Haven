import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Award, TrendingUp, Zap, Shield } from 'lucide-react';

const About = () => {
    const stats = [
        { icon: <Users className="h-8 w-8" />, value: '5000+', label: 'Active Students', color: 'from-primary-500 to-primary-600' },
        { icon: <Award className="h-8 w-8" />, value: '25+', label: 'Partner Schools', color: 'from-secondary-500 to-secondary-600' },
        { icon: <TrendingUp className="h-8 w-8" />, value: '150+', label: 'Tests Conducted', color: 'from-accent-500 to-accent-600' },
        { icon: <Zap className="h-8 w-8" />, value: '98%', label: 'Success Rate', color: 'from-success-500 to-success-600' },
    ];

    const values = [
        {
            icon: <Target className="h-10 w-10 text-primary-400" />,
            title: 'Innovation First',
            description: 'Leveraging cutting-edge technology to transform traditional education systems into modern, efficient digital platforms.'
        },
        {
            icon: <Shield className="h-10 w-10 text-secondary-400" />,
            title: 'Security & Privacy',
            description: 'Enterprise-grade security measures ensuring complete data protection and privacy for all users across the platform.'
        },
        {
            icon: <Users className="h-10 w-10 text-accent-400" />,
            title: 'User-Centric Design',
            description: 'Intuitive interfaces designed with extensive user research to ensure seamless experience for all stakeholders.'
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 pt-16">
            {/* Hero Section */}
            <section className="relative pt-20 pb-20 overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                            About <span className="bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">TestHaven</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Revolutionizing education management with cutting-edge technology and innovative solutions that empower institutions to achieve excellence.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300 hover:bg-white/10 hover:border-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/10"
                            >
                                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-white`}>
                                    {stat.icon}
                                </div>
                                <h3 className="text-4xl font-bold text-white mb-2">{stat.value}</h3>
                                <p className="text-gray-400">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-20 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/5 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-bold text-white mb-4">Our Story</h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto"></div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                                    TestHaven was born from the vision of making school management and online testing accessible, efficient, and effective for educational institutions across India. We recognized the challenges faced by schools in managing multiple aspects of education - from conducting tests to tracking student performance.
                                </p>
                                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                                    Founded in 2024, our journey began with a simple question: <span className="text-primary-400 font-semibold">"How can we leverage technology to make education management effortless?"</span> This question led us to develop a comprehensive platform that addresses the real needs of schools, principals, and students.
                                </p>
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    Today, TestHaven serves over 25 schools and 5000+ students, conducting 150+ tests monthly. Our platform has become a trusted partner in the educational journey, helping institutions focus on what matters most - quality education.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <div className="bg-gradient-to-br from-primary-500/10 to-primary-600/10 backdrop-blur-xl border border-primary-500/20 rounded-2xl p-8">
                                <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    To empower educational institutions with innovative technology solutions that simplify management, enhance learning experiences, and drive academic excellence through data-driven insights and seamless digital transformation.
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-secondary-500/10 to-secondary-600/10 backdrop-blur-xl border border-secondary-500/20 rounded-2xl p-8">
                                <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    To become India's leading education technology platform, setting new standards in school management and online assessment, while making quality education accessible and measurable for every student.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-bold text-white mb-4">Our Core Values</h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            The principles that guide everything we do
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:bg-white/10 hover:border-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/10"
                            >
                                <div className="mb-4">{value.icon}</div>
                                <h3 className="text-2xl font-bold text-white mb-3">{value.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
