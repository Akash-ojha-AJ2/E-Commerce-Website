import { Seller } from "../models/SellerModel.js";
import { Order } from "../models/OrderModel.js";
import { Notification } from "../models/notificationModel.js";
import { Product } from "../models/productModel.js";

export const getSellerOrders = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });

    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    const orders = await Order.find({ 
      _id: { $in: seller.ordersReceived } 
    })
    .populate({
      path: "user",
      select: "name email phoneNumber address city state pinCode"
    })
    .populate({
      path: "orderItems.product",
      select: "name images price brand"
    })
    .populate({
      path: "orderItems.seller",
      select: "businessName"
    })
    .sort({ createdAt: -1 });

    const filteredOrders = orders.map(order => {
      const sellerItems = order.orderItems.filter(item => 
        item.seller && item.seller._id.toString() === seller._id.toString()
      );

      if (sellerItems.length === 0) {
        return null;
      }

      const sellerTotal = sellerItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      return {
        _id: order._id,
        orderStatus: order.orderStatus,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentInfo?.status || 'Pending',
        createdAt: order.createdAt,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        user: order.user,
        shippingInfo: order.shippingInfo,
        sellerItems: sellerItems, 
        sellerTotal: sellerTotal, 
        itemsCount: sellerItems.length 
      };
    }).filter(order => order !== null); 

    res.status(200).json({ 
      success: true, 
      orders: filteredOrders,
      totalOrders: filteredOrders.length,
      seller: {
        businessName: seller.businessName,
        _id: seller._id
      }
    });

  } catch (err) {
    console.error('Get seller orders error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// Seller order status update
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, carrier } = req.body;

    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name');
    
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const oldStatus = order.orderStatus;

    order.orderStatus = status;
    
    if (status === "Delivered") order.deliveredAt = Date.now();
    if (status === "Shipped") {
      order.shippedAt = Date.now();
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (carrier) order.carrier = carrier;
    }

    await order.save();

    if (oldStatus !== status) {
      let notificationMessage = '';
      let notificationTitle = 'Order Status Updated';

      const productNames = order.orderItems.map(item => item.name);
      let productsText = '';
      
      if (productNames.length === 1) {
        productsText = productNames[0];
      } else if (productNames.length === 2) {
        productsText = `${productNames[0]} and ${productNames[1]}`;
      } else {
        productsText = `${productNames[0]}, ${productNames[1]} and ${productNames.length - 2} more items`;
      }
      
      switch (status) {
        case 'Confirmed':
          notificationMessage = `✅ Your order for ${productsText} has been confirmed and is being processed.`;
          notificationTitle = 'Order Confirmed';
          break;
        case 'Packed':
          notificationMessage = `📦 Your order for ${productsText} has been packed and is ready for shipment.`;
          notificationTitle = 'Order Packed';
          break;
        case 'Shipped':
          const trackingInfo = trackingNumber ? ` Tracking #: ${trackingNumber}` : '';
          notificationMessage = `🚚 Your order for ${productsText} has been shipped!${trackingInfo}`;
          notificationTitle = 'Order Shipped';
          break;
        case 'Delivered':
          notificationMessage = `🎉 Your order for ${productsText} has been delivered successfully! Thank you for shopping with us.`;
          notificationTitle = 'Order Delivered';
          break;
        case 'Cancelled':
          notificationMessage = `❌ Your order for ${productsText} has been cancelled. Contact support for more details.`;
          notificationTitle = 'Order Cancelled';
          break;
        case 'Returned':
          notificationMessage = `🔄 Your order for ${productsText} has been returned. Refund will be processed shortly.`;
          notificationTitle = 'Order Returned';
          break;
        case 'Processing':
          notificationMessage = `⏳ Your order for ${productsText} is being processed by the seller.`;
          notificationTitle = 'Order Processing';
          break;
        default:
          notificationMessage = `ℹ️ Status updated for your order containing ${productsText}. New status: ${status}`;
      }

      await Notification.create({
        user: order.user._id,
        title: notificationTitle,
        message: notificationMessage,
        type: 'order_status_update',
        isRead: false,
        relatedEntity: {
          type: 'order',
          id: order._id
        },
        metadata: {
          orderId: order._id,
          oldStatus: oldStatus,
          newStatus: status,
          trackingNumber: trackingNumber,
          carrier: carrier,
          products: productNames
        }
      });
    }

    res.status(200).json({ 
      success: true, 
      order,
      notificationSent: oldStatus !== status,
      message: `Order status updated to ${status} successfully`
    });
  } catch (err) {
    console.error('❌ Error updating order status:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};



export const getSellerStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const seller = await Seller.findOne({ user: userId });
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller profile not found'
      });
    }

    const sellerId = seller._id;
  
    const totalProducts = await Product.countDocuments({ seller: sellerId });

    const totalOrders = await Order.countDocuments({
      'orderItems.seller': sellerId
    });

    const pendingOrders = await Order.countDocuments({
      'orderItems.seller': sellerId,
      orderStatus: { $in: ['Processing', 'Confirmed', 'pending'] }
    });

    const totalRevenue = seller.paymentHistory
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);

    const deliveredOrders = await Order.find({
      'orderItems.seller': sellerId,
      orderStatus: 'Delivered'
    });

    let pendingRevenue = 0;
    deliveredOrders.forEach(order => {
      const isPaid = seller.paymentHistory.some(payment => 
        payment.orderIds && 
        Array.isArray(payment.orderIds) && 
        payment.orderIds.some(paidOrderId => 
          paidOrderId && paidOrderId.toString() === order._id.toString()
        )
      );

      if (!isPaid) {
        const sellerItems = order.orderItems.filter(item => 
          item.seller.toString() === sellerId.toString()
        );
        const orderValue = sellerItems.reduce((sum, item) => 
          sum + (item.price * item.quantity), 0
        );
        const platformFee = orderValue * 0.10;
        const shippingFee = 100 * sellerItems.length;
        const sellerEarnings = orderValue - platformFee - shippingFee;
        
        pendingRevenue += sellerEarnings;
      }
    });

    const lifetimeEarnings = seller.earnings?.totalEarnings || 0;

    // 7. Recent 3 Orders with Full Information
    const recentOrders = await Order.find({
      'orderItems.seller': sellerId
    })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate('user', 'name email phoneNumber')
    .populate('orderItems.product', 'name images')
    .lean();

    const formattedRecentOrders = recentOrders.map(order => {
      const sellerItems = order.orderItems.filter(item => 
        item.seller.toString() === sellerId.toString()
      );

      const sellerOrderTotal = sellerItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );

      const isPaid = seller.paymentHistory.some(payment => 
        payment.orderIds && 
        Array.isArray(payment.orderIds) && 
        payment.orderIds.some(paidOrderId => 
          paidOrderId && paidOrderId.toString() === order._id.toString()
        )
      );

      return {
        _id: order._id,
        orderId: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
        customer: {
          name: order.user?.name || 'Unknown',
          email: order.user?.email || 'Unknown',
          phone: order.user?.phoneNumber || 'N/A'
        },
        items: sellerItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          productId: item.product?._id,
          productName: item.product?.name
        })),
        totalAmount: sellerOrderTotal,
        status: order.orderStatus,
        paymentMethod: order.paymentMethod,
        paymentStatus: isPaid ? 'Paid' : 'Unpaid',
        orderDate: order.createdAt,
        shippingInfo: order.shippingInfo,
        deliveredAt: order.deliveredAt,
        shippedAt: order.shippedAt,
        isPaid: isPaid
      };
    });

    // 8. ✅ Payment Summary
    const completedPayments = seller.paymentHistory.filter(p => p.status === 'completed');
    const pendingPayments = seller.paymentHistory.filter(p => p.status === 'pending');

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,          
        pendingRevenue,         
        lifetimeEarnings,       
        
        // Order Statistics
        totalProducts,
        totalOrders,
        pendingOrders,
        
        // ✅ Payment Statistics
        totalPayments: completedPayments.length,
        totalPaymentAmount: totalRevenue,
        pendingPaymentAmount: pendingPayments.reduce((sum, p) => sum + p.amount, 0)
      },
      recentOrders: formattedRecentOrders,
      paymentSummary: {
        completed: completedPayments.length,
        pending: pendingPayments.length,
        failed: seller.paymentHistory.filter(p => p.status === 'failed').length
      }
    });

  } catch (error) {
    console.error('Error fetching seller stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};