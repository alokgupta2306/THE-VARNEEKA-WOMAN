const Order = require('../models/Order');
const Product = require('../models/Product');
const nodemailer = require('nodemailer');

// Send order confirmation email
const sendOrderEmail = async (order) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port: Number(process.env.BREVO_SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_API_KEY
      }
    });

    await transporter.sendMail({
      from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
      to: order.customerEmail,
      subject: 'Order Confirmed - The Varneeka Woman',
      html: `
        <h2>Thank you for your order, ${order.customerName}!</h2>
        <p>Your order has been placed successfully.</p>
        <p><strong>Tracking ID:</strong> ${order.trackingId}</p>
        <p><strong>Amount:</strong> ₹${order.totalAmount}</p>
        <p>— The Varneeka Woman Team</p>
      `
    });
  } catch (err) {
    console.log('Email error:', err.message);
  }
};

// @desc Place a new order
// @route POST /api/orders
exports.placeOrder = async (req, res) => {
  try {
    const { productId, customerName, customerEmail, customerPhone, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    const totalAmount = product.price * quantity;

    const order = await Order.create({
      user: req.user.id,
      product: productId,
      customerName,
      customerEmail,
      customerPhone,
      quantity,
      totalAmount,
      trackingId: 'TVW' + Date.now()
    });

    // Reduce stock
    product.stock -= quantity;
    await product.save();

    // Send email
    await sendOrderEmail(order);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get logged in customer orders
// @route GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('product', 'name image price fabric colour')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all orders (admin)
// @route GET /api/orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('product', 'name image price fabric colour')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update order status (admin)
// @route PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = status;
    await order.save();

    // Send email update
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.BREVO_SMTP_HOST,
        port: Number(process.env.BREVO_SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.BREVO_SMTP_USER,
          pass: process.env.BREVO_API_KEY
        }
      });

      await transporter.sendMail({
        from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
        to: order.customerEmail,
        subject: `Order Update - ${status} | The Varneeka Woman`,
        html: `
          <h2>Hello ${order.customerName},</h2>
          <p>Your order status has been updated to <strong>${status}</strong>.</p>
          <p><strong>Tracking ID:</strong> ${order.trackingId}</p>
          <p>— The Varneeka Woman Team</p>
        `
      });
    } catch (emailErr) {
      console.log('Email error:', emailErr.message);
    }

    res.json({ message: `Order status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Add feedback after delivery
// @route POST /api/orders/:id/feedback
exports.addFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({ message: 'You can only give feedback after delivery' });
    }

    order.feedback = { rating, comment };
    await order.save();

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};