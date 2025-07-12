const User = require("../models/User");
const bcrypt = require("bcryptjs");
const cloudinary = require("../config/cloudinary");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
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
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "avatars",
      });
      updates.avatar = result.secure_url;
    }
    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Utility function to update user stats (can be called internally)
exports.updateUserStats = async (userId) => {
  try {
    if (!userId) {
      console.error("updateUserStats: userId is required");
      return null;
    }

    const Swap = require("../models/Swap");
    const Review = require("../models/Review");

    // Count completed swaps with proper error handling
    let completedSwapsCount = 0;
    try {
      completedSwapsCount = await Swap.countDocuments({
        status: "completed",
        $or: [{ sender: userId }, { receiver: userId }],
      });
    } catch (err) {
      console.error("Error counting completed swaps:", err);
      completedSwapsCount = 0;
    }

    // Calculate average rating with proper error handling
    let avgRating = 0;
    let reviewsCount = 0;
    try {
      const reviews = await Review.find({ reviewee: userId });
      reviewsCount = reviews.length;
      if (reviewsCount > 0) {
        const totalRating = reviews.reduce(
          (acc, r) => acc + (r.rating || 0),
          0
        );
        avgRating = totalRating / reviewsCount;
      }
    } catch (err) {
      console.error("Error calculating average rating:", err);
      avgRating = 0;
      reviewsCount = 0;
    }

    // Update user with proper error handling
    try {
      await User.findByIdAndUpdate(userId, {
        completedSwapsCount,
        rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
        numReviews: reviewsCount,
      });
    } catch (err) {
      console.error("Error updating user stats in database:", err);
      throw err;
    }

    const result = {
      completedSwapsCount,
      rating: Math.round(avgRating * 10) / 10,
      numReviews: reviewsCount,
    };

    return result;
  } catch (err) {
    console.error("Error updating user stats:", err);
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
      updatedCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Debug endpoint to check completed swaps count
exports.debugCompletedSwapsCount = async (req, res) => {
  try {
    const Swap = require("../models/Swap");
    const userId = req.user.id;

    // Get user's current stored count
    const user = await User.findById(userId);

    // Count actual completed swaps
    const actualCompletedSwaps = await Swap.find({
      status: "completed",
      $or: [{ sender: userId }, { receiver: userId }],
    });

    const actualCount = actualCompletedSwaps.length;
    const storedCount = user.completedSwapsCount || 0;

    res.json({
      userId,
      storedCount,
      actualCount,
      discrepancy: actualCount - storedCount,
      completedSwaps: actualCompletedSwaps.map((swap) => ({
        id: swap._id,
        status: swap.status,
        sender: swap.sender,
        receiver: swap.receiver,
        completedAt: swap.completedAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Force refresh completed swaps count for current user
exports.forceRefreshCompletedCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Force update user stats
    const result = await exports.updateUserStats(userId);

    // Get updated user
    const updatedUser = await User.findById(userId).select("-password");

    res.json({
      message: "Completed swaps count refreshed",
      previousCount: req.body.previousCount || "unknown",
      newCount: result.completedSwapsCount,
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
