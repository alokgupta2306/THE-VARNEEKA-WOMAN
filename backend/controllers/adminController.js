const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const axios = require('axios');

// Send email via Brevo HTTP API
const sendEmail = async (to, toName, subject, htmlContent) => {
  await axios.post('https://api.brevo.com/v3/smtp/email', {
    sender: {
      name: process.env.SENDER_NAME,
      email: process.env.SENDER_EMAIL
    },
    to: [{ email: to, name: toName }],
    subject: subject || 'Message from The Varneeka Woman',
    htmlContent: htmlContent
  }, {
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json'
    }
  });
};

// @desc Get analytics data
// @route GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments();

    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const confirmedOrders = await Order.countDocuments({ orderStatus: 'Confirmed' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'Shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

    const recentOrders = await Order.find()
      .populate('product', 'name image')
      .sort({ createdAt: -1 })
      .limit(5);

    const topProducts = await Order.aggregate([
      { $group: { _id: '$product', count: { $sum: '$quantity' } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalOrders,
      totalCustomers,
      totalProducts,
      totalRevenue,
      ordersByStatus: {
        Pending: pendingOrders,
        Confirmed: confirmedOrders,
        Shipped: shippedOrders,
        Delivered: deliveredOrders
      },
      recentOrders,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Send email to single customer
// @route POST /api/admin/send-email
exports.sendEmailToCustomer = async (req, res) => {
  try {
    const { customerEmail, customerName, message, subject } = req.body;
    console.log('Sending email to:', customerEmail);

    await sendEmail(
      customerEmail,
      customerName,
      subject || 'Message from The Varneeka Woman',
      `<h2>Hello ${customerName},</h2><p>${message}</p><p>— The Varneeka Woman Team</p>`
    );

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.log('Email error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc Send email to all customers
// @route POST /api/admin/send-email-all
exports.sendEmailToAll = async (req, res) => {
  try {
    const { message, subject } = req.body;
    const orders = await Order.find().populate('product', 'name');

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No customers found' });
    }

    for (const order of orders) {
      await sendEmail(
        order.customerEmail,
        order.customerName,
        subject || 'Message from The Varneeka Woman',
        `<h2>Hello ${order.customerName},</h2>
         <p>${message}</p>
         <p><strong>Your Order:</strong> ${order.product?.name}</p>
         <p><strong>Tracking ID:</strong> ${order.trackingId}</p>
         <p>— The Varneeka Woman Team</p>`
      );
    }

    res.json({ message: `Emails sent to ${orders.length} customers` });
  } catch (error) {
    console.log('Email error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all customers with orders
// @route GET /api/admin/customers
exports.getCustomers = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('product', 'name image fabric colour')
      .populate('user', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all payments
// @route GET /api/admin/payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Order.find({ paymentStatus: 'Paid' })
      .populate('product', 'name price')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};