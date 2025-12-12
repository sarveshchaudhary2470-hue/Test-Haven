import { downloadTemplate, parseQuestionsFromExcel } from '../utils/excelUtils';
import { X, Plus, Trash2, CheckCircle, Languages, Upload, Download } from 'lucide-react';
// ... (imports remain same)

const TestCreationModal = ({ onClose, onSuccess }) => {
    // ... (state remains same)

    // Handler for File Upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const parsedQuestions = await parseQuestionsFromExcel(file);

            // Append new questions to existing ones (or replace if empty)
            setTestForm(prev => {
                // If the form has only one empty default question, replace it
                const isDefault = prev.questions.length === 1 &&
                    !prev.questions[0].question &&
                    prev.questions[0].options.every(opt => opt === '');

                const newQuestions = isDefault
                    ? parsedQuestions
                    : [...prev.questions, ...parsedQuestions];

                return {
                    ...prev,
                    questions: newQuestions
                };
            });

            alert(`✅ Successfully added ${parsedQuestions.length} questions from Excel!`);
        } catch (error) {
            console.error(error);
            alert(`❌ Error parsing Excel: ${error.message}`);
        } finally {
            e.target.value = ''; // Reset input to allow re-uploading same file
        }
    };

    // ... (handlers remain same)

    return (
        // ... (modal structure)
        {/* Questions Header with Excel Options */ }
        < div className = "space-y-6" >
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold">Questions</h3>
                    <div className="flex items-center bg-black/20 rounded-lg p-1 border border-white/10">
                        {/* Lang switches ... */}
                        <button
                            type="button"
                            onClick={() => setTestLanguage('english')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${testLanguage === 'english' ? 'bg-primary-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            English
                        </button>
                        <button
                            type="button"
                            onClick={() => setTestLanguage('hindi')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${testLanguage === 'hindi' ? 'bg-primary-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Hindi
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Excel Actions */}
                    <button
                        type="button"
                        onClick={downloadTemplate}
                        className="text-gray-400 hover:text-white flex items-center gap-2 text-sm px-3 py-2 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
                    >
                        <Download size={16} />
                        Template
                    </button>

                    <label className="cursor-pointer bg-green-500/10 text-green-400 hover:bg-green-500/20 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors border border-green-500/20 hover:border-green-500/40">
                        <Upload size={16} />
                        Upload Excel
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </label>

                    <button
                        type="button"
                        onClick={addQuestion}
                        className="bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors border border-primary-500/20 hover:border-primary-500/40"
                    >
                        <Plus size={16} />
                        Add Question
                    </button>
                </div>
            </div>

    {/* Question List Mapping ... */ }
    {
        testForm.questions.map((q, qIndex) => (
            // ... (question mapping remains same)
            <div key={qIndex} className="bg-black/20 border border-white/5 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <label className="block text-sm text-gray-400 mb-1">
                            Question {qIndex + 1} ({testLanguage === 'english' ? 'English' : 'Hindi'})
                        </label>
                        <textarea
                            required
                            value={q.question}
                            onChange={e => updateQuestion(qIndex, 'question', e.target.value)}
                            className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500 min-h-[80px]"
                            placeholder={testLanguage === 'english' ? "Enter question text..." : "प्रश्न दर्ज करें..."}
                        />
                    </div>
                    {/* Allow deleting even if it's the only question, but handle length check elsewhere if needed or keep existing logic */}
                    <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors mt-6"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => updateQuestion(qIndex, 'correctAnswer', optIndex)}
                                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${q.correctAnswer === optIndex
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-gray-500 text-transparent hover:border-gray-300'
                                    }`}
                            >
                                <CheckCircle size={14} />
                            </button>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    required
                                    value={opt}
                                    onChange={e => updateOption(qIndex, optIndex, e.target.value)}
                                    className={`w-full bg-[#1e293b] border rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500 ${q.correctAnswer === optIndex ? 'border-green-500/50' : 'border-white/10'
                                        }`}
                                    placeholder={`${testLanguage === 'english' ? 'Option' : 'विकल्प'} ${optIndex + 1}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))
    }
                        </div >
        // ...
    );
};
                    </form >
                </div >

    <div className="p-6 border-t border-white/10 flex justify-end gap-4">
        <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-gray-400 hover:bg-white/5 transition-colors"
        >
            Cancel
        </button>
        <button
            type="submit"
            form="test-form"
            disabled={loading}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
            {loading ? 'Creating...' : 'Create Test'}
        </button>
    </div>
            </motion.div >
        </div >
    );
};

export default TestCreationModal;
