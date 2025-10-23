import { User } from "../models/userModel.js";
import { Seller } from "../models/SellerModel.js";
import { Notification } from "../models/notificationModel.js";
import {Order} from "../models/OrderModel.js"
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";


// Get Admin Dashboard Stats
export const getAdminDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    
    const revenueResult = await Order.aggregate([
      {
        $match: {
          orderStatus: { $in: ['Delivered', 'Shipped', 'Confirmed'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    const totalCompletedOrders = await Order.countDocuments({ 
      orderStatus: 'Delivered' 
    });

    const totalSellers = await Seller.countDocuments({ approved: true });

    const platformEarningsResult = await Seller.aggregate([
      {
        $match: { approved: true }
      },
      {
        $group: {
          _id: null,
          totalSellerEarnings: { $sum: '$earnings.totalEarnings' },
          totalPendingAmount: { $sum: '$earnings.pendingAmount' }
        }
      }
    ]);

    const totalSellerEarnings = platformEarningsResult.length > 0 ? platformEarningsResult[0].totalSellerEarnings : 0;
    const totalPendingAmount = platformEarningsResult.length > 0 ? platformEarningsResult[0].totalPendingAmount : 0;
    
    const platformCommission = totalRevenue - totalSellerEarnings;

    const topSellers = await Seller.aggregate([
      {
        $match: { 
          approved: true,
          'earnings.totalEarnings': { $gt: 0 } 
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          sellerId: '$_id',
          businessName: 1,
          userName: '$userInfo.name',
          userEmail: '$userInfo.email',
          userPhone: '$userInfo.phone',
          totalEarnings: '$earnings.totalEarnings',
          pendingAmount: '$earnings.pendingAmount',
          platformCommission: { 
            $multiply: [
              { $divide: ['$earnings.totalEarnings', 0.85] }, 
              0.15 
            ] 
          },
          totalSales: { 
            $divide: ['$earnings.totalEarnings', 0.85] 
          },
          totalOrders: { $size: '$ordersReceived' }
        }
      },
      {
        $sort: { totalEarnings: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue,
        totalCompletedOrders,
        totalSellers,
        platformCommission,
        totalSellerEarnings,
        totalPendingAmount
      },
      topSellers
    });

  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard stats'
    });
  }
};



// Get all pending payments for delivered products only
export const getAllPendingPayments = async (req, res) => {
  try {
    const deliveredOrders = await Order.find({
      orderStatus: 'Delivered'
    }).populate('orderItems.seller', 'businessName')
      .populate('orderItems.product', 'name')
      .lean();

    if (!deliveredOrders.length) {
      return res.status(200).json({
        success: true,
        sellers: [],
        summary: {
          totalSellers: 0,
          totalPendingOrders: 0,
          totalAmount: 0
        }
      });
    }

    const sellerIds = [...new Set(
      deliveredOrders.flatMap(order => 
        order.orderItems.map(item => item.seller?._id).filter(Boolean)
      )
    )];

    const sellers = await Seller.find({
      _id: { $in: sellerIds },
      approved: true
    }).populate('user', 'name email').lean();

    const sellerMap = {};
    sellers.forEach(seller => {
      sellerMap[seller._id.toString()] = seller;
    });

    const sellerOrdersMap = {};

    for (const order of deliveredOrders) {
      for (const item of order.orderItems) {
        if (!item.seller) continue;

        const sellerId = item.seller._id.toString();
        const seller = sellerMap[sellerId];
        
        if (!seller) continue;

        const isAlreadyPaid = seller.paymentHistory?.some(payment => 
          payment.orderIds && 
          Array.isArray(payment.orderIds) && 
          payment.orderIds.some(paidOrderId => 
            paidOrderId && paidOrderId.toString() === order._id.toString()
          )
        );

        if (isAlreadyPaid) continue;

        if (!sellerOrdersMap[sellerId]) {
          sellerOrdersMap[sellerId] = {
            sellerId: sellerId,
            businessName: seller.businessName,
            sellerName: seller.user?.name || 'N/A',
            sellerEmail: seller.user?.email || 'N/A',
            pendingOrders: [],
            totalPendingAmount: 0
          };
        }

        let existingOrder = sellerOrdersMap[sellerId].pendingOrders.find(
          o => o.orderId.toString() === order._id.toString()
        );

        if (!existingOrder) {
          existingOrder = {
            orderId: order._id,
            orderDate: order.createdAt,
            deliveredAt: order.deliveredAt,
            shippingInfo: order.shippingInfo,
            productDetails: [],
            sellerEarnings: 0
          };
          sellerOrdersMap[sellerId].pendingOrders.push(existingOrder);
        }

        existingOrder.productDetails.push({
          productId: item.product?._id,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        });

        const itemEarnings = item.price * item.quantity;
        existingOrder.sellerEarnings += itemEarnings;
        sellerOrdersMap[sellerId].totalPendingAmount += itemEarnings;
      }
    }

    const sellersWithCalculations = Object.values(sellerOrdersMap).map(seller => {
      const sellerOrders = seller.pendingOrders.map(order => {
        const platformFee = order.sellerEarnings * 0.10; // 10% platform fee
        const shippingCharge = 100 * order.productDetails.length; // ₹100 per product shipping
        const finalAmount = order.sellerEarnings - platformFee - shippingCharge;

        return {
          ...order,
          calculations: {
            platformFee,
            shippingCharge,
            finalAmount,
            originalAmount: order.sellerEarnings
          }
        };
      });

      const totalCalculations = sellerOrders.reduce((acc, order) => ({
        originalAmount: acc.originalAmount + order.calculations.originalAmount,
        platformFee: acc.platformFee + order.calculations.platformFee,
        shippingCharge: acc.shippingCharge + order.calculations.shippingCharge,
        finalAmount: acc.finalAmount + order.calculations.finalAmount,
      }), {
        originalAmount: 0,
        platformFee: 0,
        shippingCharge: 0,
        finalAmount: 0
      });

      return {
        ...seller,
        pendingOrders: sellerOrders,
        calculations: totalCalculations
      };
    });

    const summary = {
      totalSellers: sellersWithCalculations.length,
      totalPendingOrders: sellersWithCalculations.reduce((sum, seller) => 
        sum + seller.pendingOrders.length, 0
      ),
      totalAmount: sellersWithCalculations.reduce((sum, seller) => 
        sum + seller.calculations.finalAmount, 0
      )
    };

    res.status(200).json({
      success: true,
      sellers: sellersWithCalculations,
      summary
    });

  } catch (error) {
    console.error('Error fetching all pending payments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching pending payments'
    });
  }
};



// Process payment from admin to specific seller for delivered products
export const processAdminToSellerPayment = async (req, res) => {
  try {
    const { sellerId, orderIds } = req.body;

    if (!sellerId || !orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide seller ID and order IDs'
      });
    }

    // Verify seller exists and is approved
    const seller = await Seller.findById(sellerId).populate('user', 'name email');
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    if (!seller.approved) {
      return res.status(400).json({
        success: false,
        message: 'Seller is not approved'
      });
    }

    const orders = await Order.find({
      _id: { $in: orderIds },
      orderStatus: 'Delivered'
    });

    if (orders.length !== orderIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some orders are not delivered or not found'
      });
    }

    const alreadyPaidOrders = [];
    orders.forEach(order => {
      const isPaid = seller.paymentHistory?.some(payment => 
        payment.orderIds && 
        Array.isArray(payment.orderIds) && 
        payment.orderIds.some(paidOrderId => 
          paidOrderId && paidOrderId.toString() === order._id.toString()
        )
      );
      
      if (isPaid) {
        alreadyPaidOrders.push(order._id.toString());
      }
    });

    if (alreadyPaidOrders.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Some orders are already paid: ${alreadyPaidOrders.join(', ')}`
      });
    }

    let totalOriginalAmount = 0;
    let totalPlatformFee = 0;
    let totalShippingCharge = 0;
    let totalFinalAmount = 0;
    let productCount = 0;

    orders.forEach(order => {
      const sellerItems = order.orderItems.filter(item => 
        item.seller && item.seller.toString() === sellerId.toString()
      );
      
      const orderAmount = sellerItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
      
      const platformFee = orderAmount * 0.10;
      const shippingCharge = 100 * sellerItems.length;
      const finalAmount = orderAmount - platformFee - shippingCharge;

      totalOriginalAmount += orderAmount;
      totalPlatformFee += platformFee;
      totalShippingCharge += shippingCharge;
      totalFinalAmount += finalAmount;
      productCount += sellerItems.length;
    });

    const paymentId = `ADMINPAY${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();

    if (!seller.paymentHistory) {
      seller.paymentHistory = [];
    }

    const paymentRecord = {
      paymentId,
      orderIds: orderIds,
      amount: totalFinalAmount,
      paymentDate: new Date(),
      status: 'completed',
      processedBy: req.user._id,
      details: {
        originalAmount: totalOriginalAmount,
        platformFee: totalPlatformFee,
        shippingCharge: totalShippingCharge,
        orderCount: orderIds.length,
        productCount: productCount
      }
    };

    seller.paymentHistory.push(paymentRecord);
    
    if (!seller.earnings) {
      seller.earnings = {
        totalEarnings: 0,
        pendingAmount: 0
      };
    }

    seller.earnings.totalEarnings += totalFinalAmount;
    const currentPendingAmount = seller.earnings.pendingAmount || 0;
    seller.earnings.pendingAmount = Math.max(0, currentPendingAmount - totalFinalAmount);

    await seller.save();

    res.status(200).json({
      success: true,
      message: `Payment of ₹${totalFinalAmount} processed successfully to ${seller.businessName}`,
      payment: {
        paymentId,
        sellerName: seller.businessName,
        orderCount: orderIds.length,
        productCount: productCount,
        amount: totalFinalAmount,
        details: {
          originalAmount: totalOriginalAmount,
          platformFee: totalPlatformFee,
          shippingCharge: totalShippingCharge
        }
      }
    });

  } catch (error) {
    console.error('Error processing admin to seller payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing payment'
    });
  }
};

// GET all pending seller requests
export const getSellerRequests = async (req, res) => {
  try {
    const sellers = await Seller.find({
      approved: false,
      businessName: { $ne: "" },
      gstNumber: { $ne: "" },
      shopAddress: { $ne: "" },
      panCardNumber: { $ne: "" },
      aadhaarNumber: { $ne: "" },
    }).populate("user", "name email phone"); 

    res.status(200).json({ success: true, requests: sellers });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch seller requests",
    });
  }
};


// APPROVE or REJECT seller request
export const handleSellerApproval = async (req, res) => {
  try {
    const { userId, action } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const seller = await Seller.findOne({ user: userId });
    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller info not found" });
    }

    if (action === "approve") {
      seller.approved = true;
      await seller.save();

      user.isSeller = true;
      user.role = "seller";
      await user.save();

      await Notification.create({
        user: user._id,
        message: "🎉 Your seller request has been approved!",
      });

      return res.status(200).json({ success: true, message: "Seller approved" });
    }

    if (action === "reject") {
      const deleteResults = [];

      if (seller.panCardImageId) {
        const panDelete = await cloudinary.uploader.destroy(seller.panCardImageId);
        deleteResults.push({ panCard: panDelete });
      }

      if (seller.aadhaarImageId) {
        const aadhaarDelete = await cloudinary.uploader.destroy(seller.aadhaarImageId);
        deleteResults.push({ aadhaarCard: aadhaarDelete });
      }

      await Seller.deleteOne({ user: userId });

      user.isSeller = false;
      user.role = "user";
      user.sellerInfo = null;
      await user.save();

      await Notification.create({
        user: user._id,
        message: "❌ Your seller request has been rejected.",
      });

      return res.status(200).json({ success: true, message: "Seller request rejected" });
    }

    return res.status(400).json({ success: false, message: "Invalid action" });

  } catch (error) {
    console.error("❌ handleSellerApproval error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// Get all sellers with their basic info and stats
export const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find({})
      .populate('user', 'name email phone createdAt')
      .populate('ordersReceived', 'orderStatus totalPrice createdAt')
      .lean();

    const sellersWithStats = await Promise.all(
      sellers.map(async (seller) => {
        const totalOrders = seller.ordersReceived?.length || 0;
        
        const completedOrders = seller.ordersReceived?.filter(
          order => order.orderStatus === 'Delivered'
        ).length || 0;

        const totalRevenue = seller.ordersReceived?.reduce((sum, order) => {
          if (order.orderStatus === 'Delivered') {
            const sellerItemsValue = order.orderItems?.filter(
              item => item.seller?.toString() === seller._id.toString()
            ).reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0) || 0;
            return sum + sellerItemsValue;
          }
          return sum;
        }, 0) || 0;

        const pendingAmount = seller.earnings?.pendingAmount || 0;
        const totalEarnings = seller.earnings?.totalEarnings || 0;

        return {
          _id: seller._id,
          businessName: seller.businessName,
          sellerInfo: {
            name: seller.user?.name,
            email: seller.user?.email,
            phone: seller.user?.phone,
            joinedDate: seller.user?.createdAt
          },
          contactInfo: {
            email: seller.user?.email,
            phone: seller.user?.phone
          },
          businessDetails: {
            gstNumber: seller.gstNumber,
            shopAddress: seller.shopAddress,
            panCardNumber: seller.panCardNumber
          },
          bankDetails: seller.bankDetails || {},
          status: seller.approved ? 'Approved' : 'Pending',
          stats: {
            totalOrders,
            completedOrders,
            pendingOrders: totalOrders - completedOrders,
            totalRevenue,
            pendingAmount,
            totalEarnings
          },
          documents: {
            hasPanCard: !!seller.panCardImage,
            hasAadhaar: !!seller.aadhaarImage
          },
          createdAt: seller.createdAt
        };
      })
    );

    // Sort by creation date (newest first)
    sellersWithStats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      sellers: sellersWithStats,
      summary: {
        totalSellers: sellersWithStats.length,
        approvedSellers: sellersWithStats.filter(s => s.status === 'Approved').length,
        pendingSellers: sellersWithStats.filter(s => s.status === 'Pending').length,
        totalRevenue: sellersWithStats.reduce((sum, seller) => sum + seller.stats.totalRevenue, 0),
        totalEarnings: sellersWithStats.reduce((sum, seller) => sum + seller.stats.totalEarnings, 0)
      }
    });

  } catch (error) {
    console.error('Error fetching all sellers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching sellers information'
    });
  }
};

// Get specific seller's all orders
export const getSellerOrders = async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: 'Seller ID is required'
      });
    }

    const seller = await Seller.findById(sellerId)
      .populate('user', 'name email phone')
      .lean();


    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    const orders = await Order.find({
      'orderItems.seller': sellerId
    })
    .populate('user', 'name email phone')
    .populate('orderItems.product', 'name')
    .sort({ createdAt: -1 })
    .lean();

    const sellerOrders = orders.map(order => {
      const sellerItems = order.orderItems.filter(
        item => item.seller && item.seller.toString() === sellerId.toString()
      );

      const orderValue = sellerItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );

      const platformFee = orderValue * 0.10;
      const shippingCharge = 100 * sellerItems.length;
      const sellerEarnings = orderValue - platformFee - shippingCharge;

      // Check if order is paid
      const isPaid = seller.paymentHistory && Array.isArray(seller.paymentHistory) ? 
        seller.paymentHistory.some(payment => 
          payment.orderIds && 
          Array.isArray(payment.orderIds) && 
          payment.orderIds.some(paidOrderId => 
            paidOrderId && paidOrderId.toString() === order._id.toString()
          )
        ) : false;

      return {
        _id: order._id,
        orderId: order._id,
        customer: {
          name: order.user?.name || 'N/A',
          email: order.user?.email || 'N/A',
          phone: order.user?.phone || 'N/A'
        },
        shippingInfo: order.shippingInfo || {},
        orderDate: order.createdAt,
        deliveredAt: order.deliveredAt,
        orderStatus: order.orderStatus || 'Pending',
        paymentMethod: order.paymentMethod || 'N/A',
        paymentStatus: order.paymentInfo?.status || 'Pending',
        items: sellerItems.map(item => ({
          productId: item.product?._id,
          productName: item.name || 'Unknown Product',
          price: item.price || 0,
          quantity: item.quantity || 1,
          image: item.image || '',
          total: (item.price || 0) * (item.quantity || 1)
        })),
        financials: {
          orderValue,
          platformFee,
          shippingCharge,
          sellerEarnings,
          itemCount: sellerItems.length
        },
        isPaid
      };
    });

    // Calculate seller summary
    const summary = {
      totalOrders: sellerOrders.length,
      completedOrders: sellerOrders.filter(o => o.orderStatus === 'Delivered').length,
      pendingOrders: sellerOrders.filter(o => o.orderStatus !== 'Delivered').length,
      totalRevenue: sellerOrders.reduce((sum, order) => sum + order.financials.orderValue, 0),
      totalEarnings: sellerOrders
        .filter(o => o.orderStatus === 'Delivered')
        .reduce((sum, order) => sum + order.financials.sellerEarnings, 0),
      paidOrders: sellerOrders.filter(o => o.isPaid).length,
      unpaidOrders: sellerOrders.filter(o => !o.isPaid && o.orderStatus === 'Delivered').length
    };


    res.status(200).json({
      success: true,
      sellerInfo: {
        _id: seller._id,
        businessName: seller.businessName || 'N/A',
        sellerName: seller.user?.name || 'N/A',
        email: seller.user?.email || 'N/A',
        phone: seller.user?.phone || 'Not provided',
        gstNumber: seller.gstNumber || 'Not provided',
        shopAddress: seller.shopAddress || 'Not provided',
        approved: seller.approved || false,
        joinedDate: seller.createdAt
      },
      orders: sellerOrders,
      summary
    });

  } catch (error) {
    console.error('❌ Error fetching seller orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching seller orders: ' + error.message
    });
  }
};



// Get comprehensive admin revenue statistics
export const getAdminRevenueStats = async (req, res) => {
  try {
  
    const { period = 'all' } = req.query;
    
    // Calculate date range based on period
    let startDate = new Date('2020-01-01'); // Very old date for 'all'
    const endDate = new Date();
    
    switch (period) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // 1. Total Platform Revenue (10% commission from all orders)
    const platformRevenueResult = await Order.aggregate([
      {
        $match: {
          orderStatus: { $in: ['Delivered', 'Shipped', 'Confirmed'] },
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $unwind: '$orderItems'
      },
      {
        $group: {
          _id: null,
          totalOrderValue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
          totalPlatformRevenue: { 
            $sum: { 
              $multiply: [
                { $multiply: ['$orderItems.price', '$orderItems.quantity'] },
                0.10 // 10% platform commission
              ]
            }
          }
        }
      }
    ]);

    // 2. Total Shipping Revenue (₹100 per product)
    const shippingRevenueResult = await Order.aggregate([
      {
        $match: {
          orderStatus: { $in: ['Delivered', 'Shipped', 'Confirmed'] },
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $unwind: '$orderItems'
      },
      {
        $group: {
          _id: null,
          totalShippingRevenue: { 
            $sum: { $multiply: [100, '$orderItems.quantity'] } // ₹100 per item
          },
          totalProductsSold: { $sum: '$orderItems.quantity' }
        }
      }
    ]);

    // 3. Total Admin Revenue (Platform + Shipping)
    const totalPlatformRevenue = platformRevenueResult.length > 0 ? platformRevenueResult[0].totalPlatformRevenue : 0;
    const totalShippingRevenue = shippingRevenueResult.length > 0 ? shippingRevenueResult[0].totalShippingRevenue : 0;
    const totalAdminRevenue = totalPlatformRevenue + totalShippingRevenue;

    // 4. Order Statistics
    const orderStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: { $cond: [{ $in: ['$orderStatus', ['Delivered']] }, 1, 0] }
          },
          totalOrderValue: { $sum: '$totalPrice' }
        }
      }
    ]);

    // 5. Seller Statistics
    const sellerStats = await Seller.aggregate([
      {
        $match: {
          approved: true,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSellers: { $sum: 1 },
          totalSellerEarnings: { $sum: '$earnings.totalEarnings' }
        }
      }
    ]);

    // 6. Recent Transactions (Last 10)
    const recentTransactions = await Order.aggregate([
      {
        $match: {
          orderStatus: { $in: ['Delivered', 'Shipped', 'Confirmed'] },
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $unwind: '$orderItems'
      },
      {
        $group: {
          _id: '$_id',
          orderId: { $first: '$_id' },
          customerName: { 
            $first: { 
              $concat: [
                '$shippingInfo.firstName', 
                ' ', 
                '$shippingInfo.lastName'
              ]
            }
          },
          orderDate: { $first: '$createdAt' },
          orderStatus: { $first: '$orderStatus' },
          totalOrderValue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
          platformRevenue: { 
            $sum: { 
              $multiply: [
                { $multiply: ['$orderItems.price', '$orderItems.quantity'] },
                0.10
              ]
            }
          },
          shippingRevenue: { 
            $sum: { $multiply: [100, '$orderItems.quantity'] }
          },
          totalAdminRevenue: {
            $sum: {
              $add: [
                { $multiply: [{ $multiply: ['$orderItems.price', '$orderItems.quantity'] }, 0.10] },
                { $multiply: [100, '$orderItems.quantity'] }
              ]
            }
          }
        }
      },
      {
        $sort: { orderDate: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // 7. Revenue by Category (if you have categories)
    const revenueByMonth = await Order.aggregate([
      {
        $match: {
          orderStatus: { $in: ['Delivered', 'Shipped', 'Confirmed'] },
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $unwind: '$orderItems'
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          platformRevenue: { 
            $sum: { 
              $multiply: [
                { $multiply: ['$orderItems.price', '$orderItems.quantity'] },
                0.10
              ]
            }
          },
          shippingRevenue: { 
            $sum: { $multiply: [100, '$orderItems.quantity'] }
          },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          _id: 0,
          period: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' }
            ]
          },
          platformRevenue: 1,
          shippingRevenue: 1,
          totalRevenue: { $add: ['$platformRevenue', '$shippingRevenue'] },
          orderCount: 1
        }
      }
    ]);

    const stats = {
      period: {
        type: period,
        startDate,
        endDate
      },
      revenue: {
        totalAdminRevenue,
        platformRevenue: totalPlatformRevenue,
        shippingRevenue: totalShippingRevenue,
        breakdown: {
          platformPercentage: totalPlatformRevenue > 0 ? (totalPlatformRevenue / totalAdminRevenue * 100).toFixed(1) : 0,
          shippingPercentage: totalShippingRevenue > 0 ? (totalShippingRevenue / totalAdminRevenue * 100).toFixed(1) : 0
        }
      },
      orders: orderStats.length > 0 ? orderStats[0] : {
        totalOrders: 0,
        completedOrders: 0,
        totalOrderValue: 0
      },
      sellers: sellerStats.length > 0 ? sellerStats[0] : {
        totalSellers: 0,
        totalSellerEarnings: 0
      },
      products: shippingRevenueResult.length > 0 ? {
        totalProductsSold: shippingRevenueResult[0].totalProductsSold
      } : { totalProductsSold: 0 },
      recentTransactions,
      monthlyRevenue: revenueByMonth
    };

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching admin revenue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching revenue statistics'
    });
  }
};



// Get revenue by different time periods
export const getRevenueByTimePeriod = async (req, res) => {
  try {
    const periods = ['today', 'week', 'month', 'year', 'all'];
    const revenueByPeriod = [];

    for (const period of periods) {
      const stats = await calculateRevenueForPeriod(period);
      revenueByPeriod.push({
        period,
        ...stats
      });
    }

    res.status(200).json({
      success: true,
      revenueByPeriod
    });

  } catch (error) {
    console.error('Error fetching revenue by period:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching revenue by period'
    });
  }
};

// Helper function to calculate revenue for a specific period
async function calculateRevenueForPeriod(period) {
  let startDate = new Date('2020-01-01');
  const endDate = new Date();

  switch (period) {
    case 'today':
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  const revenueResult = await Order.aggregate([
    {
      $match: {
        orderStatus: { $in: ['Delivered', 'Shipped', 'Confirmed'] },
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $unwind: '$orderItems'
    },
    {
      $group: {
        _id: null,
        platformRevenue: { 
          $sum: { 
            $multiply: [
              { $multiply: ['$orderItems.price', '$orderItems.quantity'] },
              0.10
            ]
          }
        },
        shippingRevenue: { 
          $sum: { $multiply: [100, '$orderItems.quantity'] }
        },
        orderCount: { $sum: 1 },
        productCount: { $sum: '$orderItems.quantity' }
      }
    }
  ]);

  return revenueResult.length > 0 ? {
    platformRevenue: revenueResult[0].platformRevenue,
    shippingRevenue: revenueResult[0].shippingRevenue,
    totalRevenue: revenueResult[0].platformRevenue + revenueResult[0].shippingRevenue,
    orderCount: revenueResult[0].orderCount,
    productCount: revenueResult[0].productCount
  } : {
    platformRevenue: 0,
    shippingRevenue: 0,
    totalRevenue: 0,
    orderCount: 0,
    productCount: 0
  };
}


// Export revenue report
export const exportRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate = new Date() } = req.query;
    
    let start = new Date('2020-01-01');
    if (startDate) {
      start = new Date(startDate);
    }

    const revenueData = await Order.aggregate([
      {
        $match: {
          orderStatus: { $in: ['Delivered', 'Shipped', 'Confirmed'] },
          createdAt: { $gte: start, $lte: new Date(endDate) }
        }
      },
      {
        $unwind: '$orderItems'
      },
      {
        $group: {
          _id: {
            orderId: '$_id',
            sellerId: '$orderItems.seller'
          },
          orderDate: { $first: '$createdAt' },
          customerName: { 
            $first: { 
              $concat: [
                '$shippingInfo.firstName', 
                ' ', 
                '$shippingInfo.lastName'
              ]
            }
          },
          productName: { $first: '$orderItems.name' },
          quantity: { $sum: '$orderItems.quantity' },
          productValue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
          platformRevenue: { 
            $sum: { 
              $multiply: [
                { $multiply: ['$orderItems.price', '$orderItems.quantity'] },
                0.10
              ]
            }
          },
          shippingRevenue: { 
            $sum: { $multiply: [100, '$orderItems.quantity'] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          orderId: '$_id.orderId',
          sellerId: '$_id.sellerId',
          orderDate: 1,
          customerName: 1,
          productName: 1,
          quantity: 1,
          productValue: 1,
          platformRevenue: 1,
          shippingRevenue: 1,
          totalRevenue: { $add: ['$platformRevenue', '$shippingRevenue'] }
        }
      },
      {
        $sort: { orderDate: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      report: {
        period: { startDate: start, endDate: new Date(endDate) },
        summary: {
          totalOrders: new Set(revenueData.map(item => item.orderId.toString())).size,
          totalRevenue: revenueData.reduce((sum, item) => sum + item.totalRevenue, 0),
          totalPlatformRevenue: revenueData.reduce((sum, item) => sum + item.platformRevenue, 0),
          totalShippingRevenue: revenueData.reduce((sum, item) => sum + item.shippingRevenue, 0)
        },
        data: revenueData
      }
    });

  } catch (error) {
    console.error('Error exporting revenue report:', error);
    res.status(500).json({
      success: false,
      message: 'Server error exporting revenue report'
    });
  }
};