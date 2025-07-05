const Review = require('../models/Review');
const User = require('../models/User');

// Create a review for a user after a swap
exports.createReview = async (req, res) => {
  try {
    const { revieweeId, swapId, rating, feedback } = req.body;
    // Prevent duplicate reviews for the same swap by the same user
    const exists = await Review.findOne({ reviewer: req.user.id, swap: swapId });
    if (exists) return res.status(400).json({ message: 'Already reviewed' });
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
      .populate('swap');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 