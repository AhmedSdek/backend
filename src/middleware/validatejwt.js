import jwt from 'jsonwebtoken';
import { userModel } from '../Auth/userModel.js'
const validatejwt = async (req, res, next) => {
    const authHeader = req.get("authorization");
    if (!authHeader) {
        res.status(403).send("authorization header was not provided");
        return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        res.status(403).send("bearer token not found");
        return;
    };


    jwt.verify(token, process.env.JWT_SECRET || 'AhmedSdek1308#', async (err, payload) => {
        if (err) {
            res.status(403).send("invalid token");
            return
        }
        if (!payload) {
            res.status(403).send("invalid payload");
            return;
        }
        const user = await userModel.findOne({ email: payload.email });
        req.user = user;
        next();
    })
}

export default validatejwt;