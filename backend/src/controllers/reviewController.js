const Review = require('../models/Review');
const User = require('../models/User');
const Swap = require('../models/Swap');

// Create a review for a user after a swap
exports.createReview = async (req, res) => {
  try {
    const { revieweeId, swapId, rating, feedback } = req.body;
    
    // Check if swap exists and is fully completed
    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }
    
    if (swap.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed swaps' });
    }
    
    // Check if user is part of this swap
    if (swap.sender.toString() !== req.user.id && swap.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to review this swap' });
    }
    
    // Check if user is trying to review themselves
    if (req.user.id === revieweeId) {
      return res.status(400).json({ message: 'Cannot review yourself' });
    }
    
    // Prevent duplicate reviews for the same swap by the same user
    const exists = await Review.findOne({ reviewer: req.user.id, swap: swapId });
    if (exists) {
      return res.status(400).json({ message: 'You have already reviewed this swap' });
    }
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    const review = await Review.create({
      reviewer: req.user.id,
      reviewee: revieweeId,
      swap: swapId,
      rating,
      feedback,
    });
    
    // Update reviewee's average rating
    const reviews = await Review.find({ reviewee: revieweeId });
    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(revieweeId, { rating: avg, numReviews: reviews.length });
    
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all reviews for a user
exports.getReviewsByUser = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .populate('swap')
      .sort('-createdAt');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get reviews for a specific swap
exports.getReviewsBySwap = async (req, res) => {
  try {
    const reviews = await Review.find({ swap: req.params.swapId })
      .populate('reviewer', 'name avatar')
      .populate('reviewee', 'name avatar')
      .sort('-createdAt');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 