// import express from 'express'
// import mongoose from 'mongoose';
// import 'dotenv/config';
// import menuRouter from './src/menu/menuRoute.js';
// import cors from 'cors';
// import userRouter from './src/Auth/userRoute.js';
// import cartRouter from './src/cart/cartRoute.js';
// import { Server } from "socket.io";
// const app = express()
// const port = process.env.PORT || 3000
// app.use(cors());
// app.use(express.json());
// app.use('/user', userRouter)
// app.use('/cart', cartRouter)
// app.use('/api/menu', menuRouter)
// mongoose
//     .connect(process.env.DB_URL)
//     .then(() => console.log("Connected!"))
//     .catch((err) => console.log(err));

// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`)
// })


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

// إعداد Socket.IO وربطه بالخادم
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // عنوان React أو الواجهة الأمامية
        methods: ["GET", "POST"],
    },
});

// Middleware
app.use(cors());
app.use(express.json());

// المسارات
app.use('/user', userRouter);
app.use('/cart', cartRouter);
app.use('/api/menu', menuRouter);

// الاتصال بقاعدة البيانات
mongoose
    .connect(process.env.DB_URL)
    .then(() => console.log("Connected!"))
    .catch((err) => console.log(err));

// Socket.IO Handling
// io.on("connection", (socket) => {
//     console.log("A user connected:", socket.id);
//     // مثال: استقبال رسالة من العميل
//     socket.on("message", (data) => {
//         console.log("Message received:", data);
//         // إرسال رد للعميل
//         socket.emit("message", "Message received on the server");
//     });
//     // عند قطع الاتصال
//     socket.on("disconnect", () => {
//         console.log("A user disconnected:", socket.id);
//     });
// });
// مشاركة io مع مسار الطلبات
app.set('socketio', io);
// بدء تشغيل الخادم
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});