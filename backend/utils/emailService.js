const axios = require('axios');

const sendEmail = async (options) => {
    // Use Brevo (Sendinblue) HTTP API to avoid SMTP port blocking
    // This uses standard HTTPS (Port 443) which is never blocked

    const apiKey = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS;
    const senderEmail = process.env.EMAIL_FROM || process.env.EMAIL_USERNAME || 'noreply@testhaven.com';
    const senderName = 'TestHaven Support';

    if (!apiKey) {
        console.error('❌ EMAIL_PASSWORD (API Key) is missing in environment variables');
        return;
    }

    const emailData = {
        sender: { name: senderName, email: senderEmail },
        to: [{ email: options.email }],
        subject: options.subject,
        htmlContent: options.html || options.message,
        textContent: options.message
    };

    try {
        const response = await axios.post('https://api.brevo.com/v3/smtp/email', emailData, {
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            }
        });

        console.log(`✅ Email sent successfully via API to ${options.email}`);
        console.log('Response:', response.data);
    } catch (error) {
        console.error('❌ Email API Error:', error.response?.data || error.message);
        // Don't throw to avoid crashing the request
    }
};

module.exports = sendEmail;
