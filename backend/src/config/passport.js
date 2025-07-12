const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Local Strategy
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) return done(null, false, { message: 'Incorrect email.' });
    if (!user.password) return done(null, false, { message: 'No password set. Use Google login.' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return done(null, false, { message: 'Incorrect password.' });
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
   

    if (!profile.emails || !profile.emails[0]) {
      return done(new Error('Email is required for Google OAuth'), null);
    }

    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      // Check if user exists with same email but different auth method
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        // Update existing user with Google ID
        user.googleId = profile.id;
        if (!user.avatar && profile.photos?.[0]?.value) {
          user.avatar = profile.photos[0].value;
        }
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos?.[0]?.value || null,
          googleId: profile.id,
        });
      }
    }
    return done(null, user);
  } catch (err) {
    console.error('Google OAuth error:', err);
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport; 