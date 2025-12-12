const mongoose = require('mongoose');

const SupportMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    senderType: {
      type: String,
      enum: ['admin', 'customer'],
      default: 'customer',
    },
    senderName: {
      type: String,
      default: 'Khách hàng',
    },
    senderEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SupportMessage', SupportMessageSchema);

