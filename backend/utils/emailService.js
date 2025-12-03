const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create Transporter
    // Use environment variables for real email, or fallback to console log for dev
    const transporter = nodemailer.createTransport({
        pool: true, // Use connection pooling
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use TLS
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,   // 10 seconds
        socketTimeout: 10000,     // 10 seconds
        logger: true,
        debug: true
    });

    // Verify connection configuration
    try {
        await transporter.verify();
        console.log('✅ SMTP Connection Verified Successfully');
    } catch (error) {
        console.error('❌ SMTP Connection Verification Failed:', error);
    }

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
