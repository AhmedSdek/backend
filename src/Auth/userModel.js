import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//     firstName: {
//         type: String,
//         required: true
//     },
//     lastName: {
//         type: String,
//         required: true
//     },
//     email: {
//         type: String,
//         required: true
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     role: {
//         type: String,
//         default: 'user'
//     },
// }, {
//     timestamps: true
// });


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // إضافة هذا الحقل لضمان أن البريد الإلكتروني فريد
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'user',
    },
    isVerified: {
        type: Boolean,
        default: false, // للتحقق إذا كان البريد قد تم التحقق منه
    },
    verificationToken: {
        type: String, // لتخزين رمز التحقق الخاص بالبريد
    },
    verificationTokenExpiresAt: {
        type: Date, // تاريخ انتهاء صلاحية رمز التحقق
    },
    resetPasswordToken: { type: String }, // الرمز المستخدم لإعادة تعيين كلمة المرور
    resetPasswordExpires: { type: Date }, // تاريخ انتهاء صلاحية الرمز
}, {
    timestamps: true, // لإنشاء الحقلين createdAt و updatedAt تلقائيًا
});
export const userModel = mongoose.model('user', userSchema);
