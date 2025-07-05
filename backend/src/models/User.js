const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Not required for Google users
  avatar: { type: String }, // Cloudinary URL
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  timeZone: { type: String, default: '' },
  skillsOffered: [{ type: String }],
  skillsNeeded: [{ type: String }],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  googleId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema); 