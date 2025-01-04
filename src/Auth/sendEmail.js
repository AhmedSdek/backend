import nodemailer from "nodemailer";
// import dotenv from "dotenv";

// تحميل المتغيرات من ملف .env
// dotenv.config();
const transporter = nodemailer.createTransport({
    service: "gmail", // أو SMTP حسب مزود البريد
    auth: {
        user: "asdek229@gmail.com",
        pass: "wizb eshh oofk rwov",
    },
});

const sendEmail = async ({ to, subject, text }) => {
    const mailOptions = {
        from: "asdek229@gmail.com",
        to,
        subject,
        html: `<p>${text}</p>`,
    };
    return transporter.sendMail(mailOptions);
};

export default sendEmail;