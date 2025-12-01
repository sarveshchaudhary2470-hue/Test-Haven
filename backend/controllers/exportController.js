const Result = require('../models/Result');

// Export results as CSV
exports.exportResults = async (req, res) => {
    try {
        const { role, school } = req.user;

        // Only principals and admins can export
        if (role !== 'principal' && role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        let query = {};

        // Principals can only export their school's results
        if (role === 'principal') {
            // Get results where student belongs to principal's school
            const results = await Result.find()
                .populate({
                    path: 'student',
                    match: { school: school },
                    select: 'name email class rollNumber school'
                })
                .populate('test', 'title subject totalMarks')
                .sort({ submittedAt: -1 });

            // Filter out results where student is null (different school)
            const filteredResults = results.filter(r => r.student !== null);

            // Convert to CSV format
            const csvData = convertToCSV(filteredResults);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=student-results.csv');
            res.send(csvData);
        } else {
            // Admin can export all results
            const results = await Result.find()
                .populate('student', 'name email class rollNumber school')
                .populate('test', 'title subject totalMarks')
                .sort({ submittedAt: -1 });

            const csvData = convertToCSV(results);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=all-results.csv');
            res.send(csvData);
        }
    } catch (error) {
        console.error('Error exporting results:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper function to convert results to CSV
function convertToCSV(results) {
    const headers = ['Student Name', 'Email', 'Class', 'Roll Number', 'Test Title', 'Subject', 'Score', 'Total Marks', 'Percentage', 'Submitted At'];

    const rows = results.map(result => [
        result.student.name,
        result.student.email,
        result.student.class,
        result.student.rollNumber || 'N/A',
        result.test.title,
        result.test.subject,
        result.score,
        result.test.totalMarks,
        `${result.percentage}%`,
        new Date(result.submittedAt).toLocaleString('en-IN')
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
}
