import nodemailer from "nodemailer";
import dotenv from "dotenv";

// تحميل المتغيرات من ملف .env
dotenv.config();
const transporter = nodemailer.createTransport({
    service: "gmail", // أو SMTP حسب مزود البريد
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async ({ to, subject, text }) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: `<p>${text}</p>`,
    };
    return transporter.sendMail(mailOptions);
};

export default sendEmail;