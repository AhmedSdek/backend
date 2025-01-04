import express from 'express'
import { Login, Register, getAllOrders, getMyOrders, verifyEmail } from './userServices.js';
import validatejwt from '../middleware/validatejwt.js';
import { orderModel } from '../order/orderModel.js';
import { userModel } from './userModel.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
const router = express.Router();
router.get('/all-users', validatejwt, async (req, res) => {
    try {
        const users = await userModel.find();
        res.status(200).send({ message: 'product fitch succesfuly', data: users })
    } catch (err) {
        console.log(err)
    }
})
router.get('/my-user', validatejwt, async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await userModel.findOne(userId);
        res.status(200).send({ message: 'product fitch succesfuly', data: user })
    } catch (err) {
        console.log(err)
    }
})
router.get('/users/:id', validatejwt, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).send({ message: 'user not found' })
        }
        res.status(200).send({ message: 'user fitch succesfuly', data: user })
    } catch (err) {
        console.log(err)
    }
})
router.delete('/users/:id', validatejwt, async (req, res) => {
    try {
        const { id } = req.params;
        const deletUser = await userModel.findByIdAndDelete(id);
        if (!deletUser) {
            return res.status(404).send({ message: 'user not found' })
        }
        res.status(200).send({ message: 'user fitch succesfuly', data: deletUser })
    } catch (err) {
        console.log(err)
    }
})
router.put('/users/:id', validatejwt, async (req, res) => {
    try {
        const { id } = req.params;
        const updateUser = await userModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updateUser) {
            return res.status(404).send({ message: 'user not found' })
        }
        res.status(200).send({ message: 'user fitch succesfuly', data: updateUser })
    } catch (err) {
        console.log(err)
    }
})
// مسار التحقق من البريد
router.get("/verify-email", verifyEmail);

router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body
        const { statusCode, data } = await Register({ firstName, lastName, email, password, role });
        res.status(statusCode).json(data)
    } catch (err) {
        console.log(err)
    }
})
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const { statusCode, data } = await Login({ email, password });
        res.status(statusCode).json(data)
    } catch (err) {
        console.log(err)
    }
})


router.get('/my-orders',
    validatejwt
    , async (req, res) => {
        try {
            const userId = req.user._id;
            const { data, statusCode } = await getMyOrders({ userId });
            res.status(statusCode).send(data)
        } catch (err) {
            console.log(err);
            res.status(500).send(err)
        }
    });
router.get('/all-orders',
    validatejwt
    , async (req, res) => {
        try {
            const { data, statusCode } = await getAllOrders();
            // إرسال البيانات المصفاة
            res.status(statusCode).send(data);
            // إخطار جميع العملاء بالطلبات الجديدة فقط
            const io = req.app.get('socketio');
            io.emit('ordersUpdated', data); // إرسال الطلبات الجديدة فقط
        } catch (err) {
            console.log(err);
            res.status(500).send(err)
        }
    });
router.get('/new-orders',
    validatejwt
    , async (req, res) => {
        try {
            const { data, statusCode } = await getAllOrders();
            // تصفية الطلبات التي حالتها "new"
            const filteredData = data.filter(order => order.status === "new");

            // إرسال البيانات المصفاة
            res.status(statusCode).send(filteredData);

            // إخطار جميع العملاء بالطلبات الجديدة فقط
            const io = req.app.get('socketio');
            io.emit('ordersUpdated', filteredData); // إرسال الطلبات الجديدة فقط
        } catch (err) {
            console.log(err);
            res.status(500).send(err)
        }
    });

router.put('/:id', validatejwt, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // تعديل الكود هنا لتحديث status داخل كائن
        const order = await orderModel.findByIdAndUpdate(id, { status: status }, { new: true });

        if (!order) {  // التحقق من وجود الطلب وليس product
            return res.status(404).send({ message: 'Order not found' });
        }

        // بث إشعار بتحديث حالة الطلب
        const io = req.app.get('socketio');
        io.emit('orderStatusUpdated', { id: order._id, status });

        res.status(200).send({ message: 'Order updated successfully', data: order });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Error! Can't update the order", data: err });
    }
});



router.post("/request-password-reset", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // إنشاء رمز إعادة التعيين
        const resetToken = crypto.randomBytes(32).toString("hex");
        console.log(resetToken)
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // صالح لمدة ساعة واحدة
        await user.save();
        // إرسال البريد الإلكتروني
        const resetLink = `http://mern-front-teal.vercel.app/reset-password?token=${resetToken}`;
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            to: email,
            subject: "Reset Your Password",
            html: `<p>Click the link below to reset your password:</p>
                    <a href="${resetLink}">${resetLink}</a>`,
        });

        res.status(200).json({ message: "Password reset link sent to email", data: resetToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error sending reset email" });
    }
});
router.post("/reset-password", async (req, res) => {
    const { token } = req.query;
    const { newPassword } = req.body;

    try {
        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }, // التحقق من أن التوكن صالح
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token", data: token });
        }

        // تحديث كلمة المرور
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error resetting password" });
    }
});
export default router;