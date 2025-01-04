import { userModel } from "./userModel.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { orderModel } from "../order/orderModel.js";
import cron from 'node-cron'
export const Register = async ({ firstName, lastName, email, password, role }) => {
    try {
        const findUser = await userModel.findOne({ email: email });
        if (findUser) {
            return { data: 'user already exist', statusCode: 400 }
        };
        const hashdPassword = await bcrypt.hash(password, 10)
        const newUser = new userModel({ firstName, lastName, email, password: hashdPassword, role });
        await newUser.save();
        // return { data: generateJWT({ firstName, lastName, email }), statusCode: 200 };
        return {
            data: { token: generateJWT({ email }), firstName, lastName, role }, statusCode: 200
        };
    } catch (err) {
        console.log(err)
        return { data: 'wrong Register', statusCode: 500 }
    }
};

export const Login = async ({ email, password }) => {
    try {
        const findUser = await userModel.findOne({ email: email });
        if (!findUser) {
            return { data: 'Incorrect email or password', statusCode: 400 }
        };
        const passwordMatch = await bcrypt.compare(password, findUser.password);
        if (passwordMatch) {
            return {
                data: {
                    token: generateJWT({ email }),
                    firstName: findUser.firstName,
                    lastName: findUser.lastName,
                    role: findUser.role
                },
                statusCode: 200
            };
        }
        return { data: 'Incorrect email or password', statusCode: 400 }
    } catch (err) {
        console.log(err)
        return { data: 'wrong Login', statusCode: 500 }
        // res.status(500).send(err)
    }
}
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
cron.schedule('* * * * *', async () => {
    try {
        const oneWeekAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);
        const result = await orderModel.deleteMany({ createdAt: { $lte: oneWeekAgo } });
        console.log(`${result.deletedCount} orders deleted.`);
    } catch (err) {
        console.error('Error deleting old orders:', err);
    }
});
const generateJWT = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET || 'AhmedSdek1308#')
}
