const express = require('express');
const router = express.Router();
const { getAnalytics, sendEmailToCustomer, sendEmailToAll, getCustomers, getPayments } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/customers', protect, adminOnly, getCustomers);
router.get('/payments', protect, adminOnly, getPayments);
router.post('/send-email', protect, adminOnly, sendEmailToCustomer);
router.post('/send-email-all', protect, adminOnly, sendEmailToAll);

module.exports = router;