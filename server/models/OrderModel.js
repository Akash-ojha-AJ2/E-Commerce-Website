// models/OrderModel.js

import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },

  shippingInfo: {
    firstName: String,
    lastName: String,
    phoneNumber: String,
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
  },

  orderItems: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, default: 1 },
      image: { type: String, required: true },
      product: { type: mongoose.Schema.ObjectId, ref: 'Product', required: true },
      seller: { type: mongoose.Schema.ObjectId, ref: 'Seller', required: true },
    },
  ],

  totalPrice: { type: Number, required: true },

  paymentMethod: {
    type: String,
    enum: ['razorpay', 'Razorpay', 'cod', 'COD'],
    required: true,
  },

  purchasePurpose: { type: String, enum: ['personal', 'gift'], default: 'personal' },

  paymentInfo: {
    id: String,
    orderId: String,
    signature: String,
    status: { 
      type: String, 
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending' 
    },
  },

  orderStatus: {
    type: String,
    enum: ['Processing', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Failed','pending'],
    default: 'Pending',
  },

  deliveredAt: Date,
  shippedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

export const Order   = mongoose.model('Order', orderSchema);

