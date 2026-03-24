const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 25,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: "29ef5a64e9c281",
        pass: "62373d58a23ca3",
    },
});

module.exports = {
    sendMail: async (to, contentOrUrl, subject = "request resetpassword email") => {
        // Check if it's a URL (old format) or custom HTML content
        let htmlContent;
        let textContent;
        
        if (contentOrUrl.startsWith('http')) {
            // Old format: URL for reset password
            htmlContent = `Click vào <a href="${contentOrUrl}">đây</a> để reset password`;
            textContent = `Click vào link này để reset password: ${contentOrUrl}`;
        } else {
            // New format: Custom HTML content
            htmlContent = contentOrUrl;
            textContent = contentOrUrl.replace(/<[^>]*>/g, ''); // Remove HTML tags for text version
        }

        const info = await transporter.sendMail({
            from: 'Admin@ecommerce.com',
            to: to,
            subject: subject,
            text: textContent,
            html: htmlContent,
        });

        console.log("Message sent:", info.messageId);
        return info;
    }
}