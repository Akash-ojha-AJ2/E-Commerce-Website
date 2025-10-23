import {Order} from '../models/OrderModel.js';
import {Product} from '../models/productModel.js';
import { Notification } from '../models/notificationModel.js';
import {Seller} from '../models/SellerModel.js'
import crypto from 'crypto';
import razorpay from 'razorpay';
import {User} from "../models/userModel.js"

// Initialize Razorpay
const rzp = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Get Razorpay Key
export const getRazorpayKey = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Razorpay key',
      error: error.message,
    });
  }
};


// Create Razorpay Order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: Math.round(amount), 
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await rzp.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating Razorpay order',
      error: error.message,
    });
  }
};

// Verify Razorpay Payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message,
    });
  }
};


// Create Single Product Order (After Razorpay Payment)
export const createSingleOrder = async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItems,
      totalPrice,
      paymentMethod,
      purchasePurpose,
      paymentInfo
    } = req.body;

    const sellerOrdersMap = new Map();

    for (let item of orderItems) {
      const product = await Product.findById(item.product).populate({
        path: 'seller',
        model: 'Seller',
        populate: {
          path: 'user',
          model: 'User'
        }
      });
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}. Available: ${product.stock}`,
        });
      }

      // Track sellers for notifications
      if (product.seller && product.seller.user) {
        const sellerUserId = product.seller.user._id;
        
        if (!sellerOrdersMap.has(sellerUserId.toString())) {
          sellerOrdersMap.set(sellerUserId.toString(), {
            seller: product.seller,
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
      }
    }

    // ✅ STEP 1: Create order first
    const order = await Order.create({
      user: req.user._id,
      shippingInfo,
      orderItems,
      totalPrice,
      paymentMethod: paymentMethod.toLowerCase(),
      purchasePurpose,
      paymentInfo,
      orderStatus: paymentInfo.status === 'Paid' ? 'Confirmed' : 'Processing'
    });

    try {
        await User.findByIdAndUpdate(
            req.user._id,
            { $push: { orders: order._id } }, 
            { new: true, useFindAndModify: false } 
        );
    } catch (userUpdateError) {
        console.error(`⚠️ Failed to add order ${order._id} to user ${req.user._id}'s list:`, userUpdateError);
    }

    const stockUpdatePromises = orderItems.map(item =>
      Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true }
      )
    );
    await Promise.all(stockUpdatePromises);

    const sellerUpdatePromises = [];
    for (const [sellerUserId, sellerData] of sellerOrdersMap) {
      sellerUpdatePromises.push(
        Seller.findByIdAndUpdate(
          sellerData.seller._id,
          { $push: { ordersReceived: order._id } },
          { new: true }
        )
      );
    }
    await Promise.all(sellerUpdatePromises);
    const notificationPromises = [];
    
    for (const [sellerUserId, sellerData] of sellerOrdersMap) {
      const productNames = sellerData.products.map(p => p.name).join(', ');
      const totalItems = sellerData.products.reduce((sum, p) => sum + p.quantity, 0);
      
      const notificationMessage = `🎉 New Order! You have received an order for ${totalItems} item(s): ${productNames}. Total amount: ₹${sellerData.totalAmount}`;

      // Create notification for each seller
      const notificationPromise = Notification.create({
        user: sellerUserId,
        message: notificationMessage,
        type: 'new_order',
        isRead: false,
        relatedEntity: {
          type: 'order',
          id: order._id
        }
      });

      notificationPromises.push(notificationPromise);
    }

    // Wait for all notifications to be created
    await Promise.all(notificationPromises);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
      notificationsSent: sellerOrdersMap.size
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message,
    });
  }
};

// Create COD Order
export const createCODOrder = async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItems,
      totalPrice,
      paymentMethod,
      purchasePurpose,
      paymentInfo
    } = req.body;

    const sellerOrdersMap = new Map();

    // Validate product stock and details
    for (let item of orderItems) {
      const product = await Product.findById(item.product).populate({
        path: 'seller',
        model: 'Seller',
        populate: {
          path: 'user',
          model: 'User'
        }
      });
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}. Available: ${product.stock}`,
        });
      }

      // Track sellers for notifications
      if (product.seller && product.seller.user) {
        const sellerUserId = product.seller.user._id;
        
        if (!sellerOrdersMap.has(sellerUserId.toString())) {
          sellerOrdersMap.set(sellerUserId.toString(), {
            seller: product.seller,
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
      }
    }

    // ✅ STEP 1: Create COD order first
    const order = await Order.create({
      user: req.user._id,
      shippingInfo,
      orderItems,
      totalPrice,
      paymentMethod: 'cod',
      purchasePurpose,
      paymentInfo: {
        status: 'Pending'
      },
      orderStatus: 'Processing'
    });

    try {
        await User.findByIdAndUpdate(
            req.user._id,
            { $push: { orders: order._id } }, 
            { new: true, useFindAndModify: false } 
        );
    } catch (userUpdateError) {
        console.error(`⚠️ Failed to add order ${order._id} to user ${req.user._id}'s list:`, userUpdateError);
    }

    // ✅ STEP 2: Update product stock for COD orders
    const stockUpdatePromises = orderItems.map(item =>
      Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true }
      )
    );
    await Promise.all(stockUpdatePromises);


    // ✅ STEP 3: Add order to sellers' ordersReceived
    const sellerUpdatePromises = [];
    for (const [sellerUserId, sellerData] of sellerOrdersMap) {
      sellerUpdatePromises.push(
        Seller.findByIdAndUpdate(
          sellerData.seller._id,
          { $push: { ordersReceived: order._id } },
          { new: true }
        )
      );
    }
    await Promise.all(sellerUpdatePromises);

    const notificationPromises = [];
    
    for (const [sellerUserId, sellerData] of sellerOrdersMap) {
      const productNames = sellerData.products.map(p => p.name).join(', ');
      const totalItems = sellerData.products.reduce((sum, p) => sum + p.quantity, 0);
      
      const notificationMessage = `🎉 New COD Order! You have received a COD order for ${totalItems} item(s): ${productNames}. Total amount: ₹${sellerData.totalAmount}`;

      // Create notification for each seller
      const notificationPromise = Notification.create({
        user: sellerUserId,
        message: notificationMessage,
        type: 'new_order',
        isRead: false,
        relatedEntity: {
          type: 'order',
          id: order._id
        }
      });

      notificationPromises.push(notificationPromise);
    }

    // Wait for all notifications to be created
    await Promise.all(notificationPromises);

    res.status(201).json({
      success: true,
      message: 'COD order placed successfully',
      order,
      notificationsSent: sellerOrdersMap.size
    });
  } catch (error) {
    console.error('COD order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating COD order',
      error: error.message,
    });
  }
};
// Get User Orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
};

// Get Single Order Details
export const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images brand')
      .populate('orderItems.seller', 'shopName');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if order belongs to the user
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This order does not belong to you.',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order details',
      error: error.message,
    });
  }
};