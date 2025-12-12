const mongoose = require("mongoose");
const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const createOrder = async (userId, data) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  } = data;

  if (!orderItems || orderItems.length === 0) {
    const err = new Error("Order items không được để trống");
    err.code = "NO_ITEMS";
    throw err;
  }

  for (const item of orderItems) {
    const isValidObjectId =
      item.product && mongoose.Types.ObjectId.isValid(item.product);
    if (!isValidObjectId) {
      continue;
    }

    const product = await Product.findById(item.product);
    if (!product) {
      const err = new Error(`Product không tồn tại: ${item.name}`);
      err.code = "PRODUCT_NOT_FOUND";
      throw err;
    }

    if (product.stock < item.qty) {
      const err = new Error(`Không đủ hàng cho sản phẩm: ${item.name}`);
      err.code = "OUT_OF_STOCK";
      throw err;
    }
  }

  for (const item of orderItems) {
    const isValidObjectId =
      item.product && mongoose.Types.ObjectId.isValid(item.product);
    if (!isValidObjectId) {
      continue;
    }

    const product = await Product.findById(item.product);
    if (!product) {
      continue;
    }

    product.stock = product.stock - item.qty;
    await product.save();
  }

  const order = await Order.create({
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    user: userId,
  });

  return order;
};


const getOrderById = async (id) => {
  return await Order.findById(id).populate("user", "username email");
};

const getMyOrders = async (userId) => {
  return await Order.find({ user: userId }).sort({ createdAt: -1 });
};

const getAllOrders = async () => {
  return await Order.find()
    .populate("user", "username email")
    .sort({ createdAt: -1 });
};

const markOrderPaid = async (id) => {
  const order = await Order.findById(id);
  if (!order) return null;
  order.isPaid = true;
  order.paidAt = new Date();
  await order.save();
  return order;
};

const markOrderDelivered = async (id) => {
  const order = await Order.findById(id);
  if (!order) return null;
  order.isDelivered = true;
  order.deliveredAt = new Date();
  await order.save();
  return order;
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  markOrderPaid,
  markOrderDelivered,
};
