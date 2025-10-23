import {Order} from "../models/OrderModel.js";
import {User} from "../models/userModel.js";
import {Seller} from "../models/SellerModel.js";
import { Review } from "../models/reviewModel.js";
import { Cart } from "../models/cardModel.js";
import { Product } from "../models/productModel.js";
import { Notification } from "../models/notificationModel.js";
import mongoose from "mongoose"

export const placeOrder = async (req, res) => {
  try {
    const {
      userId,
      shippingInfo,
      orderItems,
      totalPrice,
      paymentMethod,
      paymentInfo,
    } = req.body;

    const newOrder = await Order.create({
      user: userId,
      shippingInfo,
      orderItems,
      totalPrice,
      paymentMethod,
      paymentInfo,
    });

    await User.findByIdAndUpdate(userId, {
      $push: { orders: newOrder._id },
    });

    for (const item of orderItems) {
      const updatedSeller = await Seller.findOneAndUpdate(
        { user: item.seller },
        { $push: { ordersReceived: newOrder._id } },
        { new: true }
      );

      if (!updatedSeller) {
        console.warn(
          `⚠️ Seller not found for item "${item.name}" (User ID: ${item.seller})`
        );
      } else {
        console.log(
          `✅ Order ${newOrder._id} added to seller ${updatedSeller._id}`
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (err) {
    console.error("❌ Order placement failed:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Server Error",
    });
  }
};



export const getUserOrders = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const orders = await Order.find({ user: userId })
      .populate({
        path: "orderItems.product",
        select: "name price images category brand specifications",
      })
      .populate({
        path: "orderItems.seller",
        select: "businessName user",
        populate: {
          path: "user",
          select: "name email"
        }
      })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: `ORD${order._id.toString().slice(-6).toUpperCase()}`,
      createdAt: order.createdAt,
      totalPrice: order.totalPrice,
      orderStatus: order.orderStatus,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentInfo?.status || 'Pending',
      shippingInfo: order.shippingInfo,
      orderItems: order.orderItems.map(item => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        product: item.product ? {
          _id: item.product._id,
          name: item.product.name,
          images: item.product.images,
          category: item.product.category,
          brand: item.product.brand,
          specifications: item.product.specifications
        } : null,
        seller: item.seller ? {
          _id: item.seller._id,
          businessName: item.seller.businessName,
          user: item.seller.user
        } : null,
        itemStatus: item.itemStatus || order.orderStatus
      })),
      timeline: {
        ordered: order.createdAt,
        packed: order.packedAt,
        shipped: order.shippedAt,
        delivered: order.deliveredAt
      }
    }));

    res.status(200).json({
      success: true,
      count: orders.length,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};


import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
  });
} catch (error) {
  console.error('❌ Razorpay initialization failed:', error);
}



export const createOrderFromCart = async (req, res) => {
  try {
    const { shippingInfo, paymentMethod, paymentInfo, purchasePurpose = 'personal' } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId }).populate({
      path: 'products.productId',
      model: 'Product',
      populate: {
        path: 'seller',
        model: 'Seller',
        populate: {
          path: 'user',
          model: 'User',
          select: '_id'
        }
      }
    });

    if (!cart || !cart.products || cart.products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    const orderItems = [];
    let totalPrice = 0;
    const sellerOrdersMap = new Map();

    for (const item of cart.products) {
      const product = item.productId;
      
      if (!product) {
        console.log('⚠️ Skipping deleted product');
        continue;
      }

      // Check stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} items available.`
        });
      }

      // Get seller and seller's user ID
      const seller = product.seller;
      
      if (seller && seller.user) {
        const sellerUserId = seller.user._id; 
        
        orderItems.push({
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: product.images[0]?.url || '',
          product: product._id,
          seller: seller._id 
        });

        if (!sellerOrdersMap.has(sellerUserId.toString())) {
          sellerOrdersMap.set(sellerUserId.toString(), {
            seller: seller,
            products: [],
            totalAmount: 0
          });
        }
        
        const sellerData = sellerOrdersMap.get(sellerUserId.toString());
        sellerData.products.push({
          productId: product._id,
          name: product.name,
          quantity: item.quantity,
          price: product.price
        });
        sellerData.totalAmount += product.price * item.quantity;

        totalPrice += product.price * item.quantity;
      } else {
        console.log('⚠️ Product has no valid seller, skipping:', product._id);
      }
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid products in cart'
      });
    }

    const notificationPromises = [];
    
    for (const [sellerUserId, sellerData] of sellerOrdersMap) {
      const productNames = sellerData.products.map(p => p.name).join(', ');
      const totalItems = sellerData.products.reduce((sum, p) => sum + p.quantity, 0);
      
      const notificationMessage = `🎉 New Order! You have received an order for ${totalItems} item(s): ${productNames}. Total amount: ₹${sellerData.totalAmount}`;

      const notificationPromise = Notification.create({
        user: sellerUserId, 
        message: notificationMessage,
        type: 'new_order',
        isRead: false,
        relatedEntity: {
          type: 'order',
          id: null 
        }
      });

      notificationPromises.push(notificationPromise);
      
    }

    await Promise.all(notificationPromises);

    // Create main order
    const orderData = {
      user: userId,
      orderItems,
      shippingInfo,
      paymentMethod,
      paymentInfo: paymentMethod === 'cod' ? { status: 'Pending' } : paymentInfo,
      totalPrice,
      purchasePurpose,
      orderStatus: 'Processing'
    };

    const order = await Order.create(orderData);

    try {
        await User.findByIdAndUpdate(
            userId, 
            { $push: { orders: order._id } }, 
            { new: true, useFindAndModify: false }
        );
    } catch (userUpdateError) {
        console.error(`⚠️ Failed to add order ${order._id} to user ${userId}'s list:`, userUpdateError);
    }

    await Notification.updateMany(
      { 
        'relatedEntity.type': 'order',
        'relatedEntity.id': null,
        user: { $in: Array.from(sellerOrdersMap.keys()) }
      },
      { $set: { 'relatedEntity.id': order._id } }
    );

    const stockUpdatePromises = [];
    const sellerUpdatePromises = [];

    for (const [sellerUserId, sellerData] of sellerOrdersMap) {
      for (const productItem of sellerData.products) {
        stockUpdatePromises.push(
          Product.findByIdAndUpdate(
            productItem.productId,
            { $inc: { stock: -productItem.quantity } },
            { new: true }
          )
        );
      }

      sellerUpdatePromises.push(
        Seller.findByIdAndUpdate(
          sellerData.seller._id,
          { $push: { ordersReceived: order._id } },
          { new: true }
        )
      );
    }

    await Promise.all([...stockUpdatePromises, ...sellerUpdatePromises]);

    await Cart.findOneAndUpdate(
      { userId },
      { $set: { products: [] } }
    );

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: order,
      notificationsSent: sellerOrdersMap.size
    });

  } catch (error) {
    console.error('❌ Error creating order:', error);
    
    // More detailed error logging
    if (error.name === 'ValidationError') {
      console.error('📋 Validation Errors:', error.errors);
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      errorType: error.name
    });
  }
};


// Get single order
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images specifications')
      .populate('orderItems.seller', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    // Validate status
    const validStatuses = ['Processing', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.orderStatus = status;
    
    // Set timestamps based on status
    if (status === 'Shipped') {
      order.shippedAt = new Date();
    } else if (status === 'Delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });

  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};



export const getRazorpayKeyy = async (req, res) => {
  res.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID
  });
};

export const getRazorpayKey = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID) {
      return res.status(500).json({
        success: false,
        message: 'Payment configuration error'
      });
    }

    res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Get Razorpay key error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment key'
    });
  }
};

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount || amount < 100) { // Minimum 1 INR
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Minimum amount is 1 INR.'
      });
    }

    // Check if Razorpay is initialized
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Payment service is temporarily unavailable'
      });
    }

    const options = {
      amount: Math.round(amount), // amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1 // Auto capture payment
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      message: 'Payment order created successfully'
    });

  } catch (err) {
    console.error('❌ Razorpay order creation error:', err);
    
    let errorMessage = 'Failed to create payment order';
    if (err.error && err.error.description) {
      errorMessage = err.error.description;
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: err.message
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;


    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data'
      });
    }

    // Check if secret key is available
    if (!process.env.RAZORPAY_SECRET) {
      console.error('❌ RAZORPAY_SECRET is not set');
      return res.status(500).json({
        success: false,
        message: 'Payment verification configuration error'
      });
    }

    // Create expected signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");


    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      res.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    } else {
      console.log('❌ Payment verification failed - signature mismatch');
      res.status(400).json({
        success: false,
        message: 'Payment verification failed - invalid signature'
      });
    }

  } catch (err) {
    console.error('❌ Payment verification error:', err);
    res.status(500).json({
      success: false,
      message: 'Payment verification error',
      error: err.message
    });
  }
};

// Webhook handler (optional for future use)
export const handleWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    // Verify webhook signature
    const signature = req.headers['x-razorpay-signature'];
    
    if (secret) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        return res.status(400).json({
          success: false,
          message: 'Invalid webhook signature'
        });
      }
    }

    const { event, payload } = req.body;
    
    switch (event) {
      case 'payment.captured':
        await updateOrderStatus(payload.payment.entity.order_id, 'Paid');
        break;
      
      case 'payment.failed':
        await updateOrderStatus(payload.payment.entity.order_id, 'Failed');
        break;
      
      default:
        console.log('Unhandled webhook event:', event);
    }

    res.json({ success: true, message: 'Webhook processed' });

  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};

















// Get user orders
// export const getUserOrders = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const orders = await Order.find({ user: userId })
//       .sort({ createdAt: -1 })
//       .populate('orderItems.product', 'name images')
//       .populate('orderItems.seller', 'name');

//     res.json({
//       success: true,
//       orders,
//       count: orders.length
//     });

//   } catch (err) {
//     console.error('Get user orders error:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Internal Server Error'
//     });
//   }
// };