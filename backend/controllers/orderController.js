const Order = require('../models/Order');
const Product = require('../models/Product');
const axios = require('axios');

// Send email via Brevo HTTP API
const sendEmail = async (to, toName, subject, htmlContent) => {
  try {
    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: {
        name: process.env.SENDER_NAME,
        email: process.env.SENDER_EMAIL
      },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent
    }, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
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

    // Send confirmation email
    await sendEmail(
      customerEmail,
      customerName,
      'Order Placed - The Varneeka Woman',
            `
        <h2>Thank you for your order, ${customerName}!</h2>
        <p>Your order has been placed successfully. We will confirm it shortly.</p>
        <p><strong>Tracking ID:</strong> ${order.trackingId}</p>
        <p><strong>Amount:</strong> ₹${totalAmount}</p>
        <p>— The Varneeka Woman Team</p>
      `
    );

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

// @desc Delete/cancel order
// @route DELETE /api/orders/:id
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Restore stock
    const product = await Product.findById(order.product);
    if (product) {
      product.stock += order.quantity;
      await product.save();
    }

    await order.deleteOne();
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};