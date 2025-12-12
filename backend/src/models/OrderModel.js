const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    product: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderItems: {
      type: [orderItemSchema],
      required: true,
    },

    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },

    paymentMethod: { type: String, required: true },

    paymentResult: {
      id: String,
      status: String,
      amount: Number,
      currency: String,
    },

    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    couponCode: { type: String },
    couponDiscount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },

    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    stockDeducted: { type: Boolean, default: false },

    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    
    deliveryStatus: {
      type: String,
      enum: ['pending', 'preparing', 'shipping', 'delivered', 'returning_pickup', 'returning_shipping', 'returned'],
      default: 'pending'
    },

    isCancelled: { type: Boolean, default: false },
    cancelReason: { type: String },
    cancelRequestedAt: { type: Date },
    cancelStatus: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: null 
    },

    isReturnRequested: { type: Boolean, default: false },
    returnReason: { type: String },
    returnBankAccount: { type: String },
    returnRequestedAt: { type: Date },
    returnStatus: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: null 
    },
    returnProcessedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
