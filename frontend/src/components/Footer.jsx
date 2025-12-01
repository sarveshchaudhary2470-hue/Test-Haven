import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <GraduationCap className="h-8 w-8 text-primary-400" />
                            <span className="text-2xl font-bold">TestHaven</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Empowering education through innovative online testing and school management solutions.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-gray-400 hover:text-primary-400 transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-gray-400 hover:text-primary-400 transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="text-gray-400 hover:text-primary-400 transition-colors">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="text-gray-400 hover:text-primary-400 transition-colors">
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/contact" className="text-gray-400 hover:text-primary-400 transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center space-x-2 text-gray-400">
                                <Mail className="h-5 w-5" />
                                <span>support@testhaven.com</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-400">
                                <Phone className="h-5 w-5" />
                                <span>+91 958036XXXX</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-400">
                                <MapPin className="h-5 w-5" />
                                <span>India</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} TestHaven. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
