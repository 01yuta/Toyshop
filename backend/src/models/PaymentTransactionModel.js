const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['CARD', 'COD', 'BANK_TRANSFER', 'OTHER'],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'VND',
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
      required: true,
    },
    stripePaymentIntentId: {
      type: String,
      index: true,
    },
    transactionId: {
      type: String,
      index: true,
    },
    failureReason: {
      type: String,
    },
    refundedAt: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);

