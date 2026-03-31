const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const axios = require('axios');

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

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

// @desc Create Razorpay order
// @route POST /api/payment/create-order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${orderId}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Verify payment and update order
// @route POST /api/payment/verify
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Update order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = 'Paid';
    order.razorpayOrderId = razorpay_order_id;
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    await order.save();

    // Send confirmation email
    await sendEmail(
      order.customerEmail,
      order.customerName,
      'Payment Successful - The Varneeka Woman',
      `
        <h2>Payment Confirmed!</h2>
        <p>Hello ${order.customerName},</p>
        <p>Your payment of <strong>₹${order.totalAmount}</strong> was successful.</p>
        <p><strong>Tracking ID:</strong> ${order.trackingId}</p>
        <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
        <p>We will start processing your order now.</p>
        <p>— The Varneeka Woman Team</p>
      `
    );

    res.json({ message: 'Payment verified successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};