import mongoose, { Schema } from "mongoose";
const cartItemScema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: "Menu", required: true },
    quantity: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true }
});

const cartScema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    items: [cartItemScema],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['active', 'complited'], default: "active" }
});

export const cartModel = mongoose.model("Cart", cartScema)
