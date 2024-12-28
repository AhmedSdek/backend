import mongoose, { Schema } from "mongoose";


const orderItemScema = new Schema({
    productTitle: { type: String, required: true },
    productImage: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true }
});
const orderScema = new Schema({
    orderItems: [orderItemScema],
    total: { type: Number, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, required: true, default: 'new' },
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export const orderModel = mongoose.model('order', orderScema)
