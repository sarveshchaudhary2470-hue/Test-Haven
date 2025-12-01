// Scheduler service for auto-publishing and auto-closing tests
const cron = require('node-cron');
const Test = require('../models/Test');

class TestScheduler {
    constructor() {
        this.jobs = new Map();
    }

    // Start the scheduler - runs every minute
    start() {
        console.log('📅 Test Scheduler started');

        // Check every minute for tests to publish/close
        cron.schedule('* * * * *', async () => {
            await this.checkScheduledTests();
        });
    }

    async checkScheduledTests() {
        try {
            const now = new Date();

            // Auto-publish tests
            const testsToPublish = await Test.find({
                isPublished: false,
                scheduledPublishAt: { $lte: now },
                isClosed: false
            });

            for (const test of testsToPublish) {
                test.isPublished = true;
                await test.save();
                console.log(`✅ Auto-published test: ${test.title}`);
            }

            // Auto-close tests
            const testsToClose = await Test.find({
                isClosed: false,
                scheduledCloseAt: { $lte: now }
            });

            for (const test of testsToClose) {
                test.isClosed = true;
                test.isActive = false;
                await test.save();
                console.log(`🔒 Auto-closed test: ${test.title}`);
            }

        } catch (error) {
            console.error('Error in test scheduler:', error);
        }
    }

    // Schedule a specific test
    async scheduleTest(testId) {
        try {
            const test = await Test.findById(testId);
            if (!test) return;

            // Schedule publish
            if (test.scheduledPublishAt && !test.isPublished) {
                const delay = new Date(test.scheduledPublishAt) - Date.now();
                if (delay > 0) {
                    setTimeout(async () => {
                        test.isPublished = true;
                        await test.save();
                        console.log(`✅ Auto-published test: ${test.title}`);
                    }, delay);
                }
            }

            // Schedule close
            if (test.scheduledCloseAt && !test.isClosed) {
                const delay = new Date(test.scheduledCloseAt) - Date.now();
                if (delay > 0) {
                    setTimeout(async () => {
                        test.isClosed = true;
                        test.isActive = false;
                        await test.save();
                        console.log(`🔒 Auto-closed test: ${test.title}`);
                    }, delay);
                }
            }

        } catch (error) {
            console.error('Error scheduling test:', error);
        }
    }
}

module.exports = new TestScheduler();
