import express from 'express'
import { Login, Register, getAllOrders, getMyOrders } from './userServices.js';
import validatejwt from '../middleware/validatejwt.js';
import { orderModel } from '../order/orderModel.js';
import { userModel } from './userModel.js';

const router = express.Router();
router.get('/all-users', validatejwt, async (req, res) => {
    try {
        const users = await userModel.find();
        res.status(200).send({ message: 'product fitch succesfuly', data: users })
    } catch (err) {
        console.log(err)
    }
})
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
export default router;