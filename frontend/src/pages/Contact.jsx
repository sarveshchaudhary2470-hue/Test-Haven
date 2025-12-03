import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/contact', formData);
            setSubmitted(true);
            setFormData({ name: '', email: '', message: '' });
            setTimeout(() => setSubmitted(false), 3000);
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    };

    return (
        <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900">
            <section className="py-20 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-5xl font-bold text-white mb-6">Contact Us</h1>
                        <p className="text-xl text-gray-300">We'd love to hear from you. Get in touch with our team.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                                <Mail className="h-8 w-8 text-primary-400 mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">Email</h3>
                                <p className="text-gray-300">support@testhaven.com</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                                <Phone className="h-8 w-8 text-primary-400 mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">Phone</h3>
                                <p className="text-gray-300">+91 958036XXXX</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                                <MapPin className="h-8 w-8 text-primary-400 mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">Location</h3>
                                <p className="text-gray-300">India</p>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
                            {submitted && (
                                <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
                                    Message sent successfully!
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-300"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-300"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-300">Message</label>
                                        <span className={`text-xs ${formData.message.trim().split(/\s+/).filter(w => w.length > 0).length > 250 ? 'text-red-400' : 'text-gray-400'}`}>
                                            {formData.message.trim().split(/\s+/).filter(w => w.length > 0).length}/250 words
                                        </span>
                                    </div>
                                    <textarea
                                        required
                                        rows="4"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className={`w-full px-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-300 ${formData.message.trim().split(/\s+/).filter(w => w.length > 0).length > 250 ? 'border-red-500' : 'border-white/10'}`}
                                        placeholder="Your message..."
                                    />
                                    {formData.message.trim().split(/\s+/).filter(w => w.length > 0).length > 250 && (
                                        <p className="text-red-400 text-xs mt-1">Message cannot exceed 250 words.</p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={formData.message.trim().split(/\s+/).filter(w => w.length > 0).length > 250}
                                    className="btn-primary w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="h-5 w-5 mr-2" />
                                    Send Message
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
