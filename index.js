import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import menuRouter from './src/menu/menuRoute.js';
import cors from 'cors';
import userRouter from './src/Auth/userRoute.js';
import cartRouter from './src/cart/cartRoute.js';
import { Server } from "socket.io";
import http from 'http'; // لإعداد خادم HTTP

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