import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import menuRouter from './src/menu/menuRoute.js';
import cors from 'cors';
import userRouter from './src/Auth/userRoute.js';
import cartRouter from './src/cart/cartRoute.js';
import { Server } from "socket.io";
import http from 'http'; // لإعداد خادم HTTP
import cloudinary from 'cloudinary'
const app = express();
const port = process.env.PORT || 3000;

// إنشاء خادم HTTP وربطه بـ Express
const server = http.createServer(app);
// Middleware
app.use(cors());
app.use(express.json());
// إعداد Socket.IO وربطه بالخادم
const io = new Server(server, {
    cors: {
        origin: "*", // رابط Vercel الخاص بالواجهة الأمامية
        methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"], // السماح بالنقل عبر WebSocket وPolling
});
// إعداد Cloudinary
cloudinary.config({
    cloud_name: 'dsy9h8z8d',
    api_key: '226187663442894',
    api_secret: 'UfAe2fbJKRFveccONXeGr5OFJds',
});

// API لحذف الصورة
app.post('/delete-image', async (req, res) => {
    const { publicId } = req.body;

    try {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result === 'ok') {
            return res.status(200).json({ message: 'Image deleted successfully' });
        }
        return res.status(400).json({ message: 'Failed to delete image' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error });
    }
});
app.get("/", (req, res) => {
    res.send("Hello, World!");
});
// المسارات
app.use('/user', userRouter);
app.use('/cart', cartRouter);
app.use('/api/menu', menuRouter);

// الاتصال بقاعدة البيانات
mongoose
    .connect(process.env.DB_URL)
    .then(() => console.log("Connected!"))
    .catch((err) => console.log(err));


// مشاركة io مع مسار الطلبات
app.set('socketio', io);
// بدء تشغيل الخادم
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});