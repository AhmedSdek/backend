import mongoose from "mongoose";
const menuSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }, 
    imageId: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    trending: {
        type: Boolean,
        required: true
    }, 
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
export const menuModel = mongoose.model('Menu', menuSchema);
