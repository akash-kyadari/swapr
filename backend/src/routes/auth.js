const express = require('express');
const passport = require('../config/passport');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/auth/login' }), (req, res) => {
  // Generate JWT and set cookie
  const { signToken } = require('../utils/jwt');
  const token = signToken({ id: req.user._id });
  res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'lax' });
  res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000/');
});

module.exports = router; 