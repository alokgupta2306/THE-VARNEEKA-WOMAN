const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login, forgotPassword, resetPassword, googleAuthSuccess, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Normal auth
router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword', resetPassword);

// Get current user
router.get('/me', protect, getMe);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleAuthSuccess
);

module.exports = router;