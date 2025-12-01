import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, CheckCircle, Search, School } from 'lucide-react';
import { motion } from 'framer-motion';

const SchoolAssignmentModal = ({ test, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [schools, setSchools] = useState([]);
    const [selectedSchools, setSelectedSchools] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSchools();
        if (test?.schools) {
            // Handle both populated objects and ID strings
            const currentIds = test.schools.map(s => typeof s === 'object' ? s._id : s);
            setSelectedSchools(currentIds);
        }
    }, [test]);

    const fetchSchools = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/admin/schools', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSchools(response.data);
        } catch (error) {
            console.error('Error fetching schools:', error);
        }
    };

    const handleToggleSchool = (schoolId) => {
        setSelectedSchools(prev => {
            if (prev.includes(schoolId)) {
                return prev.filter(id => id !== schoolId);
            } else {
                return [...prev, schoolId];
            }
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/tests/${test._id}`, {
                schools: selectedSchools
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('✅ School assignments updated successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating test:', error);
            alert('❌ Failed to update school assignments');
        } finally {
            setLoading(false);
        }
    };

    const filteredSchools = schools.filter(school =>
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">Manage Assigned Schools</h2>
                        <p className="text-sm text-gray-400 mt-1">Test: {test?.title}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4 border-b border-white/10">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search schools..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="space-y-2">
                        {filteredSchools.map(school => (
                            <label
                                key={school._id}
                                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedSchools.includes(school._id)
                                        ? 'bg-primary-500/10 border-primary-500/50'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${selectedSchools.includes(school._id) ? 'bg-primary-500/20 text-primary-400' : 'bg-white/5 text-gray-400'
                                        }`}>
                                        <School size={20} />
                                    </div>
                                    <div>
                                        <p className={`font-medium ${selectedSchools.includes(school._id) ? 'text-white' : 'text-gray-300'}`}>
                                            {school.name}
                                        </p>
                                        <p className="text-xs text-gray-500">{school.city}, {school.state}</p>
                                    </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${selectedSchools.includes(school._id)
                                        ? 'bg-primary-500 border-primary-500 text-white'
                                        : 'border-gray-500'
                                    }`}>
                                    {selectedSchools.includes(school._id) && <CheckCircle size={14} />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={selectedSchools.includes(school._id)}
                                    onChange={() => handleToggleSchool(school._id)}
                                />
                            </label>
                        ))}
                        {filteredSchools.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No schools found matching "{searchTerm}"
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 flex justify-between items-center">
                    <p className="text-sm text-gray-400">
                        {selectedSchools.length} schools selected
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-gray-400 hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SchoolAssignmentModal;
