const express = require('express');
const auth = require('../middleware/auth');
const reviewController = require('../controllers/reviewController.js');
const router = express.Router();

// Post a review
router.post('/', auth, reviewController.createReview);
// Get reviews for a user
router.get('/user/:userId', reviewController.getReviewsByUser);
// Get reviews for a specific swap
router.get('/swap/:swapId', auth, reviewController.getReviewsBySwap);
// Get all reviews received by a user (for profile)
router.get('/received/:userId', reviewController.getUserReviews);

module.exports = router; 