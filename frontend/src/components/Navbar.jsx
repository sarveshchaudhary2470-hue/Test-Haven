import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const { isAuthenticated, user, logout } = useAuth();

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <nav className="fixed w-full z-50 glass-effect shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                        >
                            <GraduationCap className="h-8 w-8 text-primary-600" />
                        </motion.div>
                        <span className="text-2xl font-bold gradient-text">TestHaven</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                            Home
                        </Link>
                        <Link to="/about" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                            About
                        </Link>
                        <Link to="/contact" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                            Contact
                        </Link>
                        <Link to="/faq" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                            FAQ
                        </Link>

                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to={`/dashboard/${user?.role}`}
                                    className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={logout}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="btn-primary">
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={toggleMenu} className="text-gray-700 hover:text-primary-600">
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="md:hidden bg-white border-t border-gray-200"
                >
                    <div className="px-4 pt-2 pb-4 space-y-2">
                        <Link
                            to="/"
                            className="block px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                            onClick={toggleMenu}
                        >
                            Home
                        </Link>
                        <Link
                            to="/about"
                            className="block px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                            onClick={toggleMenu}
                        >
                            About
                        </Link>
                        <Link
                            to="/contact"
                            className="block px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                            onClick={toggleMenu}
                        >
                            Contact
                        </Link>
                        <Link
                            to="/faq"
                            className="block px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                            onClick={toggleMenu}
                        >
                            FAQ
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link
                                    to={`/dashboard/${user?.role}`}
                                    className="block px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                                    onClick={toggleMenu}
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => {
                                        logout();
                                        toggleMenu();
                                    }}
                                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="block px-3 py-2 bg-primary-600 text-white text-center rounded-lg hover:bg-primary-700 transition-colors"
                                onClick={toggleMenu}
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </motion.div>
            )}
        </nav>
    );
};

export default Navbar;
