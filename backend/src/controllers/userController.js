const User = require('../models/User');
const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    // Handle avatar upload if file present
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'avatars' });
      updates.avatar = result.secure_url;
    }
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Utility function to update user stats (can be called internally)
exports.updateUserStats = async (userId) => {
  try {
    const Swap = require('../models/Swap');
    const Review = require('../models/Review');
    
    // Count completed swaps
    const completedSwapsCount = await Swap.countDocuments({
      status: 'completed',
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    });
    
    // Calculate average rating
    const reviews = await Review.find({ reviewee: userId });
    const avgRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
    
    // Update user
    await User.findByIdAndUpdate(userId, {
      completedSwapsCount,
      rating: avgRating,
      numReviews: reviews.length
    });
    
      return { completedSwapsCount, rating: avgRating, numReviews: reviews.length };
} catch (err) {
  console.error('Error updating user stats:', err);
  throw err;
}
};

// Update all users' stats (admin function)
exports.updateAllUserStats = async (req, res) => {
  try {
    const users = await User.find({});
    let updatedCount = 0;
    
    for (const user of users) {
      try {
        await exports.updateUserStats(user._id);
        updatedCount++;
      } catch (err) {
        console.error(`Failed to update user ${user._id}:`, err);
      }
    }
    
    res.json({ 
      message: `Updated stats for ${updatedCount} users`,
      updatedCount 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 