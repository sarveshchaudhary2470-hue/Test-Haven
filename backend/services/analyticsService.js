const Result = require('../models/Result');
const Test = require('../models/Test');
const User = require('../models/User');

class AnalyticsService {
    // Get question-wise performance for a test
    async getQuestionWisePerformance(testId) {
        try {
            const results = await Result.find({ test: testId }).populate('student');
            const test = await Test.findById(testId);

            if (!test || results.length === 0) {
                return [];
            }

            const questionStats = test.questions.map((question, index) => {
                let correct = 0;
                let incorrect = 0;
                let unanswered = 0;
                let totalTime = 0;

                results.forEach(result => {
                    const answer = result.answers.find(a => a.questionId.toString() === question._id.toString());
                    if (answer) {
                        if (answer.isCorrect) correct++;
                        else incorrect++;
                        totalTime += answer.timeSpent || 0;
                    } else {
                        unanswered++;
                    }
                });

                return {
                    questionNumber: index + 1,
                    question: question.question,
                    correctCount: correct,
                    incorrectCount: incorrect,
                    unansweredCount: unanswered,
                    totalAttempts: results.length,
                    successRate: ((correct / results.length) * 100).toFixed(2),
                    averageTime: results.length > 0 ? (totalTime / results.length).toFixed(2) : 0
                };
            });

            return questionStats;
        } catch (error) {
            console.error('Error in question-wise performance:', error);
            throw error;
        }
    }

    // Get class comparison for a test
    async getClassComparison(testId) {
        try {
            const results = await Result.find({ test: testId })
                .populate('student', 'class name');

            const classStats = {};

            results.forEach(result => {
                const studentClass = result.student.class;
                if (!classStats[studentClass]) {
                    classStats[studentClass] = {
                        class: studentClass,
                        totalStudents: 0,
                        averageScore: 0,
                        averagePercentage: 0,
                        passCount: 0,
                        failCount: 0,
                        scores: []
                    };
                }

                classStats[studentClass].totalStudents++;
                classStats[studentClass].scores.push(result.score);
                if (result.isPassed) classStats[studentClass].passCount++;
                else classStats[studentClass].failCount++;
            });

            // Calculate averages
            Object.keys(classStats).forEach(cls => {
                const stats = classStats[cls];
                stats.averageScore = (stats.scores.reduce((a, b) => a + b, 0) / stats.totalStudents).toFixed(2);
                stats.averagePercentage = ((stats.averageScore / results[0].totalQuestions) * 100).toFixed(2);
                stats.passPercentage = ((stats.passCount / stats.totalStudents) * 100).toFixed(2);
                delete stats.scores; // Remove raw scores from response
            });

            return Object.values(classStats);
        } catch (error) {
            console.error('Error in class comparison:', error);
            throw error;
        }
    }

    // Get performance trends for a student
    async getStudentPerformanceTrend(studentId, subject = null, limit = 10) {
        try {
            const query = { student: studentId };

            const results = await Result.find(query)
                .populate('test', 'title subject createdAt')
                .sort({ submittedAt: -1 })
                .limit(limit);

            // Filter by subject if provided
            let filteredResults = results;
            if (subject) {
                filteredResults = results.filter(r => r.test.subject === subject);
            }

            const trend = filteredResults.map(result => ({
                testTitle: result.test.title,
                subject: result.test.subject,
                percentage: result.percentage,
                score: result.score,
                totalQuestions: result.totalQuestions,
                isPassed: result.isPassed,
                submittedAt: result.submittedAt,
                rank: result.rank
            }));

            return trend;
        } catch (error) {
            console.error('Error in student performance trend:', error);
            throw error;
        }
    }

    // Get top performers for a test
    async getTopPerformers(testId, limit = 10) {
        try {
            const results = await Result.find({ test: testId })
                .populate('student', 'name email class')
                .sort({ percentage: -1, timeTaken: 1 })
                .limit(limit);

            return results.map((result, index) => ({
                rank: index + 1,
                studentName: result.student.name,
                studentClass: result.student.class,
                percentage: result.percentage,
                score: result.score,
                timeTaken: result.timeTaken,
                submittedAt: result.submittedAt
            }));
        } catch (error) {
            console.error('Error in top performers:', error);
            throw error;
        }
    }

    // Calculate and update ranks for a test
    async calculateRanks(testId) {
        try {
            const results = await Result.find({ test: testId })
                .sort({ percentage: -1, timeTaken: 1 });

            for (let i = 0; i < results.length; i++) {
                results[i].rank = i + 1;
                await results[i].save();
            }

            return { updated: results.length };
        } catch (error) {
            console.error('Error calculating ranks:', error);
            throw error;
        }
    }

    // Get overall school performance
    async getSchoolPerformance(schoolId, startDate = null, endDate = null) {
        try {
            const query = { school: schoolId };

            if (startDate && endDate) {
                query.submittedAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
            }

            const results = await Result.find(query);

            const stats = {
                totalTests: results.length,
                averagePercentage: 0,
                passCount: 0,
                failCount: 0,
                passPercentage: 0,
                subjectWiseStats: {}
            };

            if (results.length === 0) return stats;

            let totalPercentage = 0;
            results.forEach(result => {
                totalPercentage += result.percentage;
                if (result.isPassed) stats.passCount++;
                else stats.failCount++;
            });

            stats.averagePercentage = (totalPercentage / results.length).toFixed(2);
            stats.passPercentage = ((stats.passCount / results.length) * 100).toFixed(2);

            return stats;
        } catch (error) {
            console.error('Error in school performance:', error);
            throw error;
        }
    }

    // Get comprehensive analytics for a student dashboard
    async getStudentAnalytics(studentId) {
        try {
            const results = await Result.find({ student: studentId })
                .populate('test', 'title subject totalMarks');

            const stats = {
                totalTests: results.length,
                averagePercentage: 0,
                testsPassed: 0,
                totalTimeSpent: 0,
                subjectPerformance: [],
                recentActivity: []
            };

            if (results.length === 0) return stats;

            let totalPercentage = 0;
            const subjectMap = {};

            results.forEach(result => {
                // Overall Stats
                totalPercentage += result.percentage;
                if (result.isPassed) stats.testsPassed++;
                stats.totalTimeSpent += result.timeTaken || 0;

                // Subject Stats
                const subject = result.test?.subject || 'Unknown';
                if (!subjectMap[subject]) {
                    subjectMap[subject] = {
                        subject,
                        totalPercentage: 0,
                        count: 0,
                        passed: 0
                    };
                }
                subjectMap[subject].totalPercentage += result.percentage;
                subjectMap[subject].count++;
                if (result.isPassed) subjectMap[subject].passed++;
            });

            // Calculate Averages
            stats.averagePercentage = (totalPercentage / results.length).toFixed(2);

            // Format Subject Stats
            stats.subjectPerformance = Object.values(subjectMap).map(s => ({
                subject: s.subject,
                average: (s.totalPercentage / s.count).toFixed(2),
                testsTaken: s.count,
                passRate: ((s.passed / s.count) * 100).toFixed(0)
            }));

            // Recent Activity (Last 5)
            stats.recentActivity = results
                .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
                .slice(0, 5)
                .map(r => ({
                    testName: r.test?.title || 'Unknown Test',
                    subject: r.test?.subject || 'General',
                    score: r.score,
                    percentage: r.percentage,
                    date: r.submittedAt
                }));

            return stats;
        } catch (error) {
            console.error('Error in student analytics:', error);
            throw error;
        }
    }
}

module.exports = new AnalyticsService();
