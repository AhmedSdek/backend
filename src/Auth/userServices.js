import { userModel } from "./userModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from 'jsonwebtoken';
import { orderModel } from "../order/orderModel.js";
import cron from 'node-cron'
import sendEmail from "./sendEmail.js";
// export const Register = async ({ firstName, lastName, email, password, role }) => {
//     try {
//         const findUser = await userModel.findOne({ email: email });
//         if (findUser) {
//             return { data: 'user already exist', statusCode: 400 }
//         };
//         const hashdPassword = await bcrypt.hash(password, 10)
//         const newUser = new userModel({ firstName, lastName, email, password: hashdPassword, role });
//         await newUser.save();
//         // return { data: generateJWT({ firstName, lastName, email }), statusCode: 200 };
//         return {
//             data: { token: generateJWT({ email }), firstName, lastName, role }, statusCode: 200
//         };
//     } catch (err) {
//         console.log(err)
//         return { data: 'wrong Register', statusCode: 500 }
//     }
// };

// export const Login = async ({ email, password }) => {
//     try {
//         const findUser = await userModel.findOne({ email: email });
//         if (!findUser) {
//             return { data: 'Incorrect email or password', statusCode: 400 }
//         };
//         const passwordMatch = await bcrypt.compare(password, findUser.password);
//         if (passwordMatch) {
//             return {
//                 data: {
//                     token: generateJWT({ email }),
//                     firstName: findUser.firstName,
//                     lastName: findUser.lastName,
//                     role: findUser.role
//                 },
//                 statusCode: 200
//             };
//         }
//         return { data: 'Incorrect email or password', statusCode: 400 }
//     } catch (err) {
//         console.log(err)
//         return { data: 'wrong Login', statusCode: 500 }
//         // res.status(500).send(err)
//     }
// }

export const Register = async ({ firstName, lastName, email, password, role }) => {
    try {
        const findUser = await userModel.findOne({ email: email });
        if (findUser) {
            return { data: 'User already exists', statusCode: 400 };
        }

        const hashdPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // ساعة واحدة
        const newUser = new userModel({
            firstName,
            lastName,
            email,
            password: hashdPassword,
            role,
            verificationToken,
            verificationTokenExpiresAt,
        });
        await newUser.save();

        // إرسال بريد التحقق
        const verificationLink = `http://http://localhost:5173/verify-email?token=${verificationToken}`;
        await sendEmail({
            to: email,
            subject: "Verify Your Email",
            text: `Please click the following link to verify your email: ${verificationLink}`,
        });

        return {
            data: { token: generateJWT({ email }), firstName, lastName, role }, statusCode: 200
        };
    } catch (err) {
        console.log(err);
        return { data: 'Error during registration', statusCode: 500 };
    }
};
export const Login = async ({ email, password }) => {
    try {
        const findUser = await userModel.findOne({ email: email });
        if (!findUser) {
            return { data: 'Incorrect email or password', statusCode: 400 };
        }

        if (!findUser.isVerified) {
            return { data: 'Please verify your email before logging in', statusCode: 403 };
        }

        const passwordMatch = await bcrypt.compare(password, findUser.password);
        if (passwordMatch) {
            return {
                data: {
                    token: generateJWT({ email }),
                    firstName: findUser.firstName,
                    lastName: findUser.lastName,
                    role: findUser.role,
                },
                statusCode: 200,
            };
        }

        return { data: 'Incorrect email or password', statusCode: 400 };
    } catch (err) {
        console.log(err);
        return { data: 'Error during login', statusCode: 500 };
    }
};
export const verifyEmail = async (req, res) => {
    const { token } = req.query; // احصل على التوكن من رابط الطلب

    try {
        const user = await userModel.findOne({
            verificationToken: token,
            verificationTokenExpiresAt: { $gt: Date.now() }, // تحقق من صلاحية الرمز
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.isVerified = true; // حدد المستخدم كمُحقق
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        return res.status(200).json({ message: "Email verified successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error verifying email" });
    }
};
export const getMyOrders = async ({ userId }) => {
    try {
        return { data: await orderModel.find({ userId }), statusCode: 200 }
    } catch (err) {
        console.log(err)
        return { data: 'wrong Login', statusCode: 500 }
        // res.status(500).send(err)
    }
}
export const getAllOrders = async () => {
    try {
        return { data: await orderModel.find(), statusCode: 200 }
    } catch (err) {
        console.log(err)
        return { data: 'wrong Login', statusCode: 500 }
        // res.status(500).send(err)
    }
}
// جدولة وظيفة يومية
cron.schedule('0 0 * * *', async () => {
    try {
        const oneWeekAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const result = await orderModel.deleteMany({ createdAt: { $lte: oneWeekAgo } });
        console.log(`${result.deletedCount} orders deleted.`);
    } catch (err) {
        console.error('Error deleting old orders:', err);
    }
});
const generateJWT = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET || 'AhmedSdek1308#')
}
