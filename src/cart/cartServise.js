import { menuModel } from "../menu/menuModel.js";
import { orderModel } from "../order/orderModel.js";
import { cartModel } from "./cartModel.js";


const creatCartforUser = async ({ userId }) => {
    const cart = await cartModel.create({ userId, totalAmount: 0 });
    await cart.save();
    return cart;
};

export const getActiveCartforUser = async ({ userId, productDetails }) => {
    let cart;
    if (productDetails) {
        cart = await cartModel
            .findOne({ userId, status: "active" })
            .populate("items.product");
    } else {
        cart = await cartModel.findOne({ userId, status: "active" });
    }
    if (!cart) {
        try {
            cart = await creatCartforUser({ userId });
        } catch (err) {
            console.log(err);
        }
    }
    return cart;
};

export const addItemToCart = async ({ userId, productId, quantity }) => {
    const cart = await getActiveCartforUser({ userId });
    const existInCArt = cart.items.find(
        (p) => p.product.toString() === productId
    );
    if (existInCArt) {
        return { data: "Item already exist in cart", statusCode: 400 };
    }
    const product = await menuModel.findById(productId);
    if (!product) {
        return { data: "product not found", statusCode: 400 };
    }
    cart.items.push({ product: productId, unitPrice: product.price, quantity });
    cart.totalAmount += product.price * quantity;
    await cart.save();
    return {
        data: await getActiveCartforUser({ userId, productDetails: true }),
        statusCode: 200,
    };
};

export const updateItemInCart = async ({ userId, productId, quantity }) => {
    const cart = await getActiveCartforUser({ userId });
    const existInCArt = cart.items.find(
        (p) => p.product.toString() === productId
    );
    if (!existInCArt) {
        return { data: "item does not exist in cart", statusCode: 400 };
    }
    const product = await menuModel.findById(productId);
    if (!product) {
        return { data: "product not found", statusCode: 400 };
    }
    const othercartitem = cart.items.filter(
        (p) => p.product.toString() !== productId
    );
    let total = othercartitem.reduce((sum, product) => {
        sum += product.quantity * product.unitPrice;
        return sum;
    }, 0);
    existInCArt.quantity = quantity;
    total += existInCArt.quantity * existInCArt.unitPrice;
    cart.totalAmount = total;
    await cart.save();
    return {
        data: await getActiveCartforUser({ userId, productDetails: true }),
        statusCode: 200,
    };
};

export const deleteItemInCart = async ({ userId, productId }) => {
    const cart = await getActiveCartforUser({ userId });
    const existInCArt = cart.items.find(
        (p) => p.product.toString() === productId
    );
    if (!existInCArt) {
        return { data: "item does not exist in cart", statusCode: 400 };
    }
    const othercartitem = cart.items.filter(
        (p) => p.product.toString() !== productId
    );
    const total = othercartitem.reduce((sum, product) => {
        sum += product.quantity * product.unitPrice;
        return sum;
    }, 0);
    cart.items = othercartitem;
    cart.totalAmount = total;
    await cart.save();
    return {
        data: await getActiveCartforUser({ userId, productDetails: true }),
        statusCode: 200,
    };
};

export const clearCart = async ({ userId }) => {
    const cart = await getActiveCartforUser({ userId });
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
    return { data: await getActiveCartforUser({ userId, productDetails: true }), statusCode: 200 };
};

// export const checkout = async ({ userId, address, phone }) => {
//     if (!address) {
//         return { data: "please add adress", statusCode: 400 };
//     }
//     if (!phone) {
//         return { data: "please add adress", statusCode: 400 };
//     }
//     const cart = await getActiveCartforUser({ userId });
//     const orderItems = [];
//     //loop cartItems and creat order items
//     for (const item of cart.items) {
//         const product = await menuModel.findById(item.product);
//         if (!product) {
//             return { data: "product not found", statusCode: 400 };
//         }
//         const orderItem = {
//             productTitle: product.title,
//             productImage: product.image,
//             unitPrice: item.unitPrice,
//             quantity: item.quantity,
//         };
//         orderItems.push(orderItem);
//     }

//     const order = await orderModel({
//         orderItems: orderItems,
//         total: cart.totalAmount,
//         address: address,
//         phone: phone,
//         userId: userId,

//     });
//     await order.save();
//     //update cart status
//     cart.status = "complited";
//     await cart.save();
//     return { data: order, statusCode: 200 };
// };
export const checkout = async ({ userId, address, phone, io }) => {
    if (!address) {
        return { data: "please add address", statusCode: 400 };
    }
    if (!phone) {
        return { data: "please add phone", statusCode: 400 };
    }

    // جلب السلة النشطة
    const cart = await getActiveCartforUser({ userId });
    if (!cart || cart.items.length === 0) {
        return { data: "Cart is empty", statusCode: 400 };
    }

    const orderItems = [];
    // تكرار عناصر السلة لإنشاء عناصر الطلب
    for (const item of cart.items) {
        const product = await menuModel.findById(item.product);
        if (!product) {
            return { data: "Product not found", statusCode: 400 };
        }
        const orderItem = {
            productTitle: product.title,
            productImage: product.image,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
        };
        orderItems.push(orderItem);
    }

    // إنشاء الطلب الجديد
    const order = new orderModel({
        orderItems: orderItems,
        total: cart.totalAmount,
        address: address,
        phone: phone,
        userId: userId,
        status: "new", // تحديد الحالة كـ "new"
    });

    await order.save();

    // تحديث حالة السلة إلى "complited"
    cart.status = "complited";
    await cart.save();

    // إرسال الطلب الجديد إلى الداش بورد عبر Socket.IO
    if (io) {
        io.emit("newOrder", order);
    }

    return { data: order, statusCode: 200 };
};