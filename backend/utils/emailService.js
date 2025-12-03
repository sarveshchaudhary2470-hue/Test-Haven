const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create Transporter
    // Use environment variables for real email, or fallback to console log for dev
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // 2. Define Email Options
    const mailOptions = {
        from: `TestHaven Support <${process.env.EMAIL_FROM || 'noreply@testhaven.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html // Optional: for HTML emails
    };

    // 3. Send Email
    try {
        if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
            console.log('=================================================');
            console.log('⚠️  EMAIL CREDENTIALS MISSING IN .env');
            console.log(`📧  To: ${options.email}`);
            console.log(`📝  Subject: ${options.subject}`);
            console.log(`💬  Message: ${options.message}`);
            console.log('=================================================');
            return; // Don't attempt to send if no creds
        }

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${options.email}`);
    } catch (error) {
        console.error('❌ Email send failed:', error);
        // We don't throw error here to avoid crashing the request if email fails
        // But in production, you might want to handle this differently
    }
};

module.exports = sendEmail;
