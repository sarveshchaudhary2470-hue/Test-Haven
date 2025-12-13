import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    School,
    Users,
    FileText,
    Settings,
    LogOut,
    Search,
    Plus,
    MoreVertical,
    Trash2,
    UserCheck,
    Briefcase,
    GraduationCap,
    CheckCircle,
    Trophy,
    Award,
    XCircle,
    Mail,
    Swords
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TestCreationModal from '../../components/TestCreationModal';
import SuperContestSection from '../../components/SuperContestSection';

import SuperContestResultsSection from '../../components/SuperContestResultsSection';
import AdminBattleControl from './AdminBattleControl';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);

    // Data States
    const [stats, setStats] = useState({ schools: 0, users: 0, tests: 0 });
    const [schools, setSchools] = useState([]);
    const [users, setUsers] = useState([]);
    const [tests, setTests] = useState([]);
    const [managers, setManagers] = useState([]);

    const [teachers, setTeachers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [results, setResults] = useState([]);

    // Results View State
    const [viewMode, setViewMode] = useState('schools'); // schools, classes, results
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);

    const handleSchoolClick = (school) => {
        setSelectedSchool(school);
        setViewMode('classes');
    };

    const handleClassClick = (classNum) => {
        setSelectedClass(classNum);
        setViewMode('results');
    };

    const handleBackToSchools = () => {
        setSelectedSchool(null);
        setSelectedClass(null);
        setViewMode('schools');
    };

    const handleBackToClasses = () => {
        setSelectedClass(null);
        setViewMode('classes');
    };

    // Forms & Modals
    const [showSchoolModal, setShowSchoolModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);
    const [userModalType, setUserModalType] = useState('student'); // 'student', 'principal', 'teacher', 'manager'

    // Form States
    const [schoolForm, setSchoolForm] = useState({
        name: '',
        code: '',
        address: '',
        contactEmail: '',
        contactPhone: '',
        maxClass: 12
    });

    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        school: '',
        class: '',
        rollNumber: '',
        phoneNumber: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [schoolsRes, usersRes, testsRes, managersRes, teachersRes, resultsRes, messagesRes] = await Promise.all([
                axios.get('/api/admin/schools', config),
                axios.get('/api/admin/users', config),
                axios.get('/api/tests', config),
                axios.get('/api/managers', config),
                axios.get('/api/teachers', config),
                axios.get('/api/results', config),
                axios.get('/api/contact', config)
            ]);

            setSchools(schoolsRes.data);
            setUsers(usersRes.data);
            setTests(testsRes.data);
            setManagers(managersRes.data);
            setTeachers(teachersRes.data);
            setResults(resultsRes.data);
            setMessages(messagesRes.data.data);
            setStats({
                schools: schoolsRes.data.length,
                users: usersRes.data.length,
                tests: testsRes.data.length
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleCreateSchool = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/admin/schools', schoolForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('✅ School created successfully!');
            setShowSchoolModal(false);
            setSchoolForm({ name: '', code: '', address: '', contactEmail: '', contactPhone: '', maxClass: 12 });
            fetchData();
        } catch (error) {
            console.error('Error creating school:', error);
            alert('❌ Failed to create school');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/admin/users', { ...userForm, role: userModalType }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`✅ ${userModalType.charAt(0).toUpperCase() + userModalType.slice(1)} created successfully!`);
            setShowUserModal(false);
            setUserForm({ name: '', email: '', password: '', role: 'student', school: '', class: '', rollNumber: '', phoneNumber: '', subject: '' });
            fetchData();
        } catch (error) {
            console.error('Error creating user:', error);
            alert('❌ Failed to create user');
        }
    };

    const handleSuspendUser = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/users/${userId}/suspend`,
                { isSuspended: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`✅ User ${!currentStatus ? 'suspended' : 'unsuspended'} successfully!`);
            fetchData();
        } catch (error) {
            console.error('Error suspending user:', error);
            alert('❌ Failed to update user status');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('✅ User deleted successfully!');
            fetchData();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('❌ Failed to delete user');
        }
    };

    const handleDeleteTest = async (testId) => {
        if (!window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/tests/${testId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('✅ Test deleted successfully!');
            fetchData();
        } catch (error) {
            console.error('Error deleting test:', error);
            alert('❌ Failed to delete test');
        }
    };

    const handleDeleteSchool = async (schoolId) => {
        if (!window.confirm('Are you sure you want to delete this school? This action cannot be undone.')) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/admin/schools/${schoolId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('✅ School deleted successfully!');
            fetchData();
        } catch (error) {
            console.error('Error deleting school:', error);
            alert('❌ Failed to delete school');
        }
    };

    const handleSuspendSchool = async (schoolId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/schools/${schoolId}`,
                { isActive: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`✅ School ${!currentStatus ? 'activated' : 'suspended'} successfully!`);
            fetchData();
        } catch (error) {
            console.error('Error updating school status:', error);
            alert('❌ Failed to update school status');
        }
    };

    const handleDeleteMessage = async (id) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/contact/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(messages.filter(msg => msg._id !== id));
                alert('✅ Message deleted successfully');
            } catch (error) {
                console.error('Error deleting message:', error);
                alert('❌ Failed to delete message');
            }
        }
    };

    const SidebarItem = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => {
                setActiveTab(id);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === id
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </button>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <motion.div
                initial={false}
                animate={{
                    x: isSidebarOpen ? 0 : -280,
                    opacity: 1
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#1e293b] border-r border-white/5 flex flex-col transform md:transform-none transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    }`}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-xl font-bold">T</span>
                            </div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                TestHaven
                            </h1>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden text-gray-400 hover:text-white"
                        >
                            <XCircle size={24} />
                        </button>
                    </div>

                    <nav className="space-y-2 overflow-y-auto max-h-[calc(100vh-120px)] custom-scrollbar">
                        <SidebarItem id="overview" icon={LayoutDashboard} label="Overview" />
                        <SidebarItem id="schools" icon={School} label="Schools" />
                        <SidebarItem id="principals" icon={UserCheck} label="Principals" />
                        <SidebarItem id="teachers" icon={GraduationCap} label="Teachers" />
                        <SidebarItem id="students" icon={Users} label="Students" />
                        <SidebarItem id="managers" icon={Briefcase} label="Managers" />
                        <SidebarItem id="tests" icon={FileText} label="Tests" />
                        <SidebarItem id="super-contests" icon={Trophy} label="Super Contests" />
                        <SidebarItem id="battle-control" icon={Swords} label="Battle Arena" />
                        <SidebarItem id="contest-results" icon={Trophy} label="Contest Results" />
                        <SidebarItem id="results" icon={Award} label="All Results" />
                        <SidebarItem id="messages" icon={Mail} label="Messages" />
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-[#1e293b]/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                        >
                            <MoreVertical className="rotate-90" size={24} />
                        </button>
                        <div>
                            <h2 className="text-xl font-semibold capitalize">{activeTab}</h2>
                            <p className="text-xs text-gray-400 mt-0.5 hidden md:block">Welcome back, Admin {user?.name}! 👋</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {user?.name?.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-400">{user?.email}</span>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' ? (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl p-8 relative overflow-hidden mb-8">
                                    <div className="relative z-10">
                                        <h1 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
                                        <p className="text-blue-100 max-w-2xl">
                                            Here's what's happening in your academy today. You have {stats.schools} schools and {stats.users} active users.
                                        </p>
                                    </div>
                                    <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent" />
                                    <div className="absolute -bottom-10 -right-10 h-64 w-64 bg-white/10 rounded-full blur-3xl" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Total Schools', value: stats.schools, icon: School, color: 'from-blue-500 to-cyan-500', tab: 'schools' },
                                        { label: 'Total Users', value: stats.users, icon: Users, color: 'from-purple-500 to-pink-500', tab: 'students' },
                                        { label: 'Active Tests', value: stats.tests, icon: FileText, color: 'from-orange-500 to-red-500', tab: 'tests' },
                                        { label: 'System Status', value: 'Online', icon: CheckCircle, color: 'from-green-500 to-emerald-500', tab: null }
                                    ].map((stat, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => stat.tab && setActiveTab(stat.tab)}
                                            className={`bg-[#1e293b] border border-white/5 p-6 rounded-2xl relative overflow-hidden group transition-all ${stat.tab ? 'cursor-pointer hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10' : ''}`}
                                        >
                                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform`} />
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20`}>
                                                    <stat.icon className="text-white h-6 w-6" />
                                                </div>
                                            </div>
                                            <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                                            <p className="text-gray-400 text-sm">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : activeTab === 'schools' ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <input
                                            type="text"
                                            placeholder="Search schools..."
                                            className="bg-[#1e293b] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary-500 w-64"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setShowSchoolModal(true)}
                                        className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors"
                                    >
                                        <Plus size={16} />
                                        Add School
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {schools.map((school, idx) => (
                                        <div key={school._id || idx} className="bg-[#1e293b] border border-white/5 rounded-2xl p-6 hover:border-primary-500/50 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center text-xl font-bold text-primary-400">
                                                    {school.name.charAt(0)}
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${school.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                        {school.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <button
                                                        onClick={() => setShowSchoolModal(true)} // Ideally this should open edit modal, but for now just placeholder or we can remove
                                                        className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-bold mb-1">{school.name}</h3>
                                            <p className="text-gray-400 text-sm mb-4">{school.address}</p>
                                            <div className="space-y-2 text-sm text-gray-500 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-20">Code:</span>
                                                    <span className="text-gray-300 font-mono">{school.code}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-20">Max Class:</span>
                                                    <span className="text-gray-300">{school.maxClass}th</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-20">Contact:</span>
                                                    <span className="text-gray-300">{school.contactPhone || 'N/A'}</span>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-white/5 flex gap-2">
                                                <button
                                                    onClick={() => handleSuspendSchool(school._id, school.isActive)}
                                                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${school.isActive
                                                        ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                                                        : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                                        }`}
                                                >
                                                    {school.isActive ? 'Suspend' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSchool(school._id)}
                                                    className="flex-1 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : ['principals', 'teachers', 'students', 'managers'].includes(activeTab) ? (
                            <motion.div
                                key="users"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold capitalize">{activeTab}</h2>
                                    <button
                                        onClick={() => {
                                            setUserModalType(activeTab.slice(0, -1)); // remove 's'
                                            setShowUserModal(true);
                                        }}
                                        className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors"
                                    >
                                        <Plus size={16} />
                                        Add {activeTab.slice(0, -1)}
                                    </button>
                                </div>

                                <div className="bg-[#1e293b] border border-white/5 rounded-2xl overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                                            <tr>
                                                <th className="px-6 py-4 font-medium">Name</th>
                                                <th className="px-6 py-4 font-medium">Email</th>
                                                <th className="px-6 py-4 font-medium">Role</th>
                                                <th className="px-6 py-4 font-medium">School</th>
                                                <th className="px-6 py-4 font-medium">Status</th>
                                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {(activeTab === 'principals' ? users.filter(u => u.role === 'principal') :
                                                activeTab === 'teachers' ? teachers :
                                                    activeTab === 'students' ? users.filter(u => u.role === 'student') :
                                                        managers).map((u, idx) => (
                                                            <tr key={u._id || idx} className="hover:bg-white/5 transition-colors">
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center font-bold text-xs">
                                                                            {u.name.charAt(0)}
                                                                        </div>
                                                                        <span className="font-medium">{u.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-gray-400">{u.email}</td>
                                                                <td className="px-6 py-4 capitalize">
                                                                    <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                                                                        {u.role || activeTab.slice(0, -1)}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-gray-400">{u.school?.name || 'N/A'}</td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${u.isSuspended ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                                                        {u.isSuspended ? 'Suspended' : 'Active'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <button
                                                                            onClick={() => handleSuspendUser(u._id, u.isSuspended)}
                                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${u.isSuspended
                                                                                ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                                                                : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                                                                                }`}
                                                                            title={u.isSuspended ? 'Unsuspend User' : 'Suspend User'}
                                                                        >
                                                                            {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteUser(u._id)}
                                                                            className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors"
                                                                            title="Delete User"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        ) : activeTab === 'tests' ? (
                            <motion.div
                                key="tests"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold">Tests</h2>
                                    <button
                                        onClick={() => setShowTestModal(true)}
                                        className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors w-full sm:w-auto"
                                    >
                                        <Plus size={16} />
                                        Create Test
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {tests.map((test, idx) => (
                                        <div key={test._id || idx} className="bg-[#1e293b] border border-white/5 rounded-2xl p-6 hover:border-primary-500/50 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center">
                                                    <FileText className="text-primary-400 h-6 w-6" />
                                                </div>
                                                <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium">
                                                    Class {test.class}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold mb-1">{test.title}</h3>
                                            <p className="text-gray-400 text-sm mb-4">{test.subject}</p>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">{test.questions?.length || 0} Questions</span>
                                                <span className="text-primary-400 font-medium">{test.totalMarks} Marks</span>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <School size={12} />
                                                    <span>{test.targetSchools?.length || 0} Schools</span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteTest(test._id)}
                                                    className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors flex items-center gap-1"
                                                    title="Delete Test"
                                                >
                                                    <Trash2 size={12} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : activeTab === 'super-contests' ? (
                            <motion.div
                                key="super-contests"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <SuperContestSection />
                            </motion.div>
                        ) : activeTab === 'battle-control' ? (
                            <motion.div
                                key="battle-control"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <AdminBattleControl />
                            </motion.div>
                        ) : activeTab === 'contest-results' ? (
                            <motion.div
                                key="contest-results"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <SuperContestResultsSection />
                            </motion.div>
                        ) : activeTab === 'results' ? (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-[#1e293b] border border-white/5 rounded-2xl p-6"
                            >
                                {viewMode === 'schools' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-6">Select School</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {schools.map((school) => (
                                                <div
                                                    key={school._id}
                                                    onClick={() => handleSchoolClick(school)}
                                                    className="bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-xl cursor-pointer transition-all group"
                                                >
                                                    <div className="flex items-center gap-4 mb-3">
                                                        <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                                                            <School className="h-6 w-6 text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-white">{school.name}</h3>
                                                            <p className="text-sm text-gray-400">Code: {school.code}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm text-gray-400">
                                                        <span>Max Class: {school.maxClass}</span>
                                                        <span className="text-blue-400 group-hover:translate-x-1 transition-transform">View Classes →</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {viewMode === 'classes' && selectedSchool && (
                                    <div>
                                        <div className="flex items-center gap-4 mb-6">
                                            <button
                                                onClick={handleBackToSchools}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                            >
                                                ← Back
                                            </button>
                                            <div>
                                                <h2 className="text-2xl font-bold text-white">{selectedSchool.name}</h2>
                                                <p className="text-gray-400">Select a Class</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {Array.from({ length: selectedSchool.maxClass }, (_, i) => i + 1).map((classNum) => (
                                                <button
                                                    key={classNum}
                                                    onClick={() => handleClassClick(classNum)}
                                                    className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl transition-all text-center group"
                                                >
                                                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-500/30 transition-colors">
                                                        <Users className="h-6 w-6 text-purple-400" />
                                                    </div>
                                                    <span className="text-lg font-bold text-white">Class {classNum}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {viewMode === 'results' && selectedSchool && selectedClass && (
                                    <div>
                                        <div className="flex items-center gap-4 mb-6">
                                            <button
                                                onClick={handleBackToClasses}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                            >
                                                ← Back
                                            </button>
                                            <div>
                                                <h2 className="text-2xl font-bold text-white">Class {selectedClass} Results</h2>
                                                <p className="text-gray-400">{selectedSchool.name}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {results.filter(r => {
                                                const selectedSchoolId = selectedSchool._id;
                                                const resultSchool = r.school || r.student?.school;
                                                const resultSchoolId = resultSchool?._id || resultSchool;

                                                const schoolMatch = resultSchoolId && (resultSchoolId.toString() === selectedSchoolId.toString());
                                                const classMatch = Number(r.student?.class) === Number(selectedClass);

                                                return schoolMatch && classMatch;
                                            }).length === 0 ? (
                                                <div className="text-center py-12 text-gray-400">
                                                    No results found for this class.
                                                </div>
                                            ) : (
                                                results.filter(r => {
                                                    const selectedSchoolId = selectedSchool._id;
                                                    const resultSchool = r.school || r.student?.school;
                                                    const resultSchoolId = resultSchool?._id || resultSchool;

                                                    const schoolMatch = resultSchoolId && (resultSchoolId.toString() === selectedSchoolId.toString());
                                                    const classMatch = Number(r.student?.class) === Number(selectedClass);

                                                    return schoolMatch && classMatch && r.test && r.student;
                                                }).map((result) => (
                                                    <div key={result._id} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-3 bg-white/5 rounded-full">
                                                                <Users className="h-6 w-6 text-gray-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-semibold text-lg">{result.student?.name || 'Unknown Student'}</p>
                                                                <p className="text-sm text-gray-400">
                                                                    {result.test?.title || 'Unknown Test'} • Roll No: {result.student?.rollNumber || '-'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold text-white">{result.score}/{result.test?.totalMarks || '-'}</p>
                                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${result.percentage >= 50 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                                {result.percentage >= 50 ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                                {result.percentage}%
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : null}
                    </AnimatePresence>

                    {/* User Modal */}
                    {showUserModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-[#1e293b] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
                            >
                                <h2 className="text-2xl font-bold mb-6 capitalize">Add New {userModalType}</h2>
                                <form onSubmit={handleCreateUser} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={userForm.name}
                                            onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Email</label>
                                            <input
                                                type="email"
                                                required
                                                value={userForm.email}
                                                onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Phone</label>
                                            <input
                                                type="text"
                                                value={userForm.phoneNumber}
                                                onChange={e => setUserForm({ ...userForm, phoneNumber: e.target.value })}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={userForm.password}
                                            onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500"
                                        />
                                    </div>

                                    {/* School Selection for Non-Managers */}
                                    {userModalType !== 'manager' && (
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Assign School</label>
                                            <select
                                                required
                                                value={userForm.school}
                                                onChange={e => setUserForm({ ...userForm, school: e.target.value })}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500"
                                            >
                                                <option value="">Select School</option>
                                                {schools.map(school => (
                                                    <option key={school._id} value={school._id}>{school.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Teacher Specific Fields */}
                                    {userModalType === 'teacher' && (
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Subject</label>
                                            <input
                                                type="text"
                                                required
                                                value={userForm.subject}
                                                onChange={e => setUserForm({ ...userForm, subject: e.target.value })}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500"
                                                placeholder="e.g. Mathematics, Science"
                                            />
                                        </div>
                                    )}

                                    {/* Student Specific Fields */}
                                    {userModalType === 'student' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Class</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="12"
                                                    required
                                                    value={userForm.class}
                                                    onChange={e => setUserForm({ ...userForm, class: e.target.value })}
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Roll Number</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={userForm.rollNumber}
                                                    onChange={e => setUserForm({ ...userForm, rollNumber: e.target.value })}
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4 mt-8">
                                        <button
                                            type="button"
                                            onClick={() => setShowUserModal(false)}
                                            className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-xl transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-xl transition-colors"
                                        >
                                            Create {userModalType}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}

                    {/* School Modal */}
                    {showSchoolModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-[#1e293b] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl"
                            >
                                <h2 className="text-2xl font-bold mb-6">Add New School</h2>
                                <form onSubmit={handleCreateSchool} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">School Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={schoolForm.name}
                                                onChange={e => setSchoolForm({ ...schoolForm, name: e.target.value })}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Code</label>
                                            <input
                                                type="text"
                                                required
                                                value={schoolForm.code}
                                                onChange={e => setSchoolForm({ ...schoolForm, code: e.target.value })}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Address</label>
                                        <input
                                            type="text"
                                            required
                                            value={schoolForm.address}
                                            onChange={e => setSchoolForm({ ...schoolForm, address: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Email</label>
                                            <input
                                                type="email"
                                                required
                                                value={schoolForm.contactEmail}
                                                onChange={e => setSchoolForm({ ...schoolForm, contactEmail: e.target.value })}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Phone</label>
                                            <input
                                                type="text"
                                                required
                                                value={schoolForm.contactPhone}
                                                onChange={e => setSchoolForm({ ...schoolForm, contactPhone: e.target.value })}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Max Class</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="12"
                                            required
                                            value={schoolForm.maxClass}
                                            onChange={e => setSchoolForm({ ...schoolForm, maxClass: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500"
                                        />
                                    </div>
                                    <div className="flex gap-4 mt-8">
                                        <button
                                            type="button"
                                            onClick={() => setShowSchoolModal(false)}
                                            className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-xl transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-xl transition-colors"
                                        >
                                            Create School
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}

                    {/* Test Creation Modal */}
                    <AnimatePresence>
                        {showTestModal && (
                            <TestCreationModal
                                onClose={() => setShowTestModal(false)}
                                onSuccess={fetchData}
                                user={user}
                                schools={schools}
                            />
                        )}
                    </AnimatePresence>

                    {/* Messages View */}
                    {activeTab === 'messages' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Contact Messages</h2>
                            <div className="grid gap-4">
                                {messages.length === 0 ? (
                                    <div className="text-center py-12 bg-[#1e293b] rounded-xl border border-white/5">
                                        <Mail className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                                        <p className="text-gray-400">No messages yet</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div key={msg._id} className="bg-[#1e293b] border border-white/5 rounded-xl p-6 hover:border-primary-500/30 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white">{msg.name}</h3>
                                                    <p className="text-primary-400 text-sm">{msg.email}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(msg.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteMessage(msg._id)}
                                                        className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Delete Message"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-gray-300 whitespace-pre-wrap">{msg.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
