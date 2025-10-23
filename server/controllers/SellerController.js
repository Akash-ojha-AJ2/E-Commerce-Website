import { Seller } from "../models/SellerModel.js";
import { Order } from "../models/OrderModel.js";

export const getSellerProfitSummary = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ User ID liya
    const { period = 'month' } = req.query;

    let startDate = new Date();
    const endDate = new Date();
    
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date('2020-01-01');
        break;
    }

    // ✅ CORRECT: Find seller by user ID
    const seller = await Seller.findOne({ user: userId })
      .populate('user', 'name email')
      .populate('paymentHistory.orderIds')
      .lean();

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found for this user'
      });
    }

    const sellerId = seller._id; 

    const orders = await Order.find({
      'orderItems.seller': sellerId, 
      orderStatus: { $in: ['Delivered', 'Shipped', 'Confirmed'] },
      createdAt: { $gte: startDate, $lte: endDate }
    })
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .lean();

    let totalSales = 0;
    let totalPlatformFee = 0;
    let totalShippingFee = 0;
    let totalEarnings = 0;
    let totalOrders = 0;
    let totalProducts = 0;

    const orderDetails = orders.map(order => {
      const sellerItems = order.orderItems.filter(
        item => item.seller && item.seller.toString() === sellerId.toString() 
      );

      const orderSales = sellerItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
      
      const platformFee = orderSales * 0.10; // 10% platform fee
      const shippingFee = 100 * sellerItems.length; // ₹100 per product
      const orderEarnings = orderSales - platformFee - shippingFee;
      const productCount = sellerItems.reduce((sum, item) => sum + item.quantity, 0);

      // Accumulate totals
      totalSales += orderSales;
      totalPlatformFee += platformFee;
      totalShippingFee += shippingFee;
      totalEarnings += orderEarnings;
      totalOrders += 1;
      totalProducts += productCount;

      return {
        orderId: order._id,
        orderDate: order.createdAt,
        customer: {
          name: order.user?.name,
          email: order.user?.email
        },
        orderStatus: order.orderStatus,
        items: sellerItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity
        })),
        sales: orderSales,
        deductions: {
          platformFee,
          shippingFee,
          totalDeductions: platformFee + shippingFee
        },
        earnings: orderEarnings,
        productCount,
        isPaid: seller.paymentHistory?.some(payment => 
          payment.orderIds && 
          Array.isArray(payment.orderIds) && 
          payment.orderIds.some(paidOrderId => 
            paidOrderId && paidOrderId.toString() === order._id.toString()
          )
        ) || false
      };
    });

    // Get payment history
    const paymentHistory = seller.paymentHistory?.map(payment => ({
      paymentId: payment.paymentId,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      orderCount: payment.orderIds?.length || 0,
      status: payment.status,
      details: payment.details || {}
    })).sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)) || [];

    const pendingOrders = orderDetails.filter(order => 
      order.orderStatus === 'Delivered' && !order.isPaid
    );
    const pendingAmount = pendingOrders.reduce((sum, order) => sum + order.earnings, 0);

    const summary = {
      period: {
        type: period,
        startDate,
        endDate
      },
      overview: {
        totalSales,
        totalEarnings,
        totalPlatformFee,
        totalShippingFee,
        totalOrders,
        totalProducts,
        pendingAmount,
        netEarnings: seller.earnings?.totalEarnings || 0
      },
      breakdown: {
        salesPercentage: 100,
        platformFeePercentage: totalSales > 0 ? (totalPlatformFee / totalSales * 100).toFixed(1) : 0,
        shippingFeePercentage: totalSales > 0 ? (totalShippingFee / totalSales * 100).toFixed(1) : 0,
        earningsPercentage: totalSales > 0 ? (totalEarnings / totalSales * 100).toFixed(1) : 0
      },
      recentOrders: orderDetails.slice(0, 10), // Last 10 orders
      paymentHistory: paymentHistory.slice(0, 10), // Last 10 payments
      performance: {
        averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
        productsPerOrder: totalOrders > 0 ? totalProducts / totalOrders : 0,
        conversionRate: totalOrders > 0 ? ((totalOrders / (totalOrders + pendingOrders.length)) * 100).toFixed(1) : 0
      }
    };

    res.status(200).json({
      success: true,
      seller: {
        businessName: seller.businessName,
        name: seller.user?.name,
        email: seller.user?.email
      },
      summary
    });

  } catch (error) {
    console.error('❌ Error fetching seller profit summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profit summary'
    });
  }
};


// Get seller earnings by different time periods - ✅ CORRECT FUNCTION
export const getSellerEarningsByPeriod = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ User ID liya
    const periods = ['today', 'week', 'month', 'year', 'all'];


    const seller = await Seller.findOne({ user: userId });
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    const sellerId = seller._id; // ✅ Actual seller ID

    const earningsByPeriod = await Promise.all(
      periods.map(async (period) => {
        let startDate = new Date();
        const endDate = new Date();
        
        switch (period) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
          case 'all':
            startDate = new Date('2020-01-01');
            break;
        }

        const orders = await Order.find({
          'orderItems.seller': sellerId, // ✅ Changed to sellerId
          orderStatus: { $in: ['Delivered', 'Shipped', 'Confirmed'] },
          createdAt: { $gte: startDate, $lte: endDate }
        }).lean();

        let totalSales = 0;
        let totalEarnings = 0;
        let orderCount = 0;
        let productCount = 0;

        orders.forEach(order => {
          const sellerItems = order.orderItems.filter(
            item => item.seller && item.seller.toString() === sellerId.toString() // ✅ sellerId use kiya
          );

          const orderSales = sellerItems.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
          );
          
          const platformFee = orderSales * 0.10;
          const shippingFee = 100 * sellerItems.length;
          const orderEarnings = orderSales - platformFee - shippingFee;

          totalSales += orderSales;
          totalEarnings += orderEarnings;
          orderCount += 1;
          productCount += sellerItems.reduce((sum, item) => sum + item.quantity, 0);
        });

        return {
          period,
          totalSales,
          totalEarnings,
          orderCount,
          productCount,
          averageOrderValue: orderCount > 0 ? totalSales / orderCount : 0
        };
      })
    );

    res.status(200).json({
      success: true,
      earningsByPeriod
    });

  } catch (error) {
    console.error('❌ Error fetching seller earnings by period:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching earnings by period'
    });
  }
};



export const getSellerPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id; 

    const seller = await Seller.findOne({ user: userId })
      .populate('paymentHistory.orderIds')
      .lean();

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    const paymentHistory = seller.paymentHistory?.map(payment => ({
      paymentId: payment.paymentId,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      status: payment.status,
      orderCount: payment.orderIds?.length || 0,
      orders: payment.orderIds?.map(order => ({
        orderId: order._id,
        orderDate: order.createdAt
      })) || [],
      details: payment.details || {}
    })).sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)) || [];

    // Calculate summary
    const totalPaid = paymentHistory
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);

    const pendingPayments = paymentHistory
      .filter(payment => payment.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount, 0);


    res.status(200).json({
      success: true,
      paymentHistory,
      summary: {
        totalPaid,
        pendingPayments,
        totalTransactions: paymentHistory.length,
        completedTransactions: paymentHistory.filter(p => p.status === 'completed').length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching seller payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payment history'
    });
  }
};