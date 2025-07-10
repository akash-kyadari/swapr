const express = require('express');
const passport = require('../config/passport');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Debug route to check Google OAuth config
router.get('/google/debug', (req, res) => {
  res.json({
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
    clientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
    frontendUrl: process.env.FRONTEND_URL,
    nodeEnv: process.env.NODE_ENV
  });
});

// Google OAuth
router.get('/google', (req, res, next) => {
  console.log('Google OAuth initiated');
  console.log('Environment check:', {
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    frontendUrl: process.env.FRONTEND_URL
  });
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('Google OAuth credentials missing');
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login?error=google_config_missing`);
  }
  
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', 
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login?error=google_auth_failed` 
  }), 
  (req, res) => {
    try {
      console.log('Google OAuth callback successful for user:', req.user._id);
      
      // Generate JWT and set cookie
      const { signToken } = require('../utils/jwt');
      const token = signToken({ id: req.user._id });
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });
      
      // Redirect to frontend
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login?error=token_generation_failed`);
    }
  }
);

module.exports = router; 