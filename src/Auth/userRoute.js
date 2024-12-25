import express from 'express'
import { Login, Register, getAllOrders, getMyOrders } from './userServices.js';
import validatejwt from '../middleware/validatejwt.js';
import { orderModel } from '../order/orderModel.js';

const router = express.Router();

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
router.put('/:id',
    validatejwt
    , async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updateProduct = await orderModel.findByIdAndUpdate(id, status, { new: true });
            if (!updateProduct) {
                return res.status(404).send({ message: 'product not found' })
            }
            // بث إشعار بإزالة الطلب
            const io = req.app.get('socketio');
            io.emit('orderStatusUpdated', { id: updateProduct._id, status });
            res.status(200).send({ message: 'product updated succesfuly', data: updateProduct })
        } catch (err) {
            console.log(err)
            res.status(500).send({ message: "Eror ! can't updat the product ", data: err })
        }
        // const { id } = req.params;

        // try {
        //     // البحث عن الطلب وتحديث حالته
        //     const order = await orderModel.findById(id);
        //     if (!order) {
        //         return res.status(404).send({ message: "Order not found" });
        //     }

        //     order.status = status;
        //     await order.save();

        //     // بث إشعار بإزالة الطلب
        //     io.emit('orderStatusUpdated', { id: order._id, status });

        //     res.status(200).send(order);
        // } catch (error) {
        //     console.error(error);
        //     res.status(500).send({ message: "Failed to update order status" });
        // }
    });
export default router;