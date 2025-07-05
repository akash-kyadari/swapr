const express = require('express');
const auth = require('../middleware/auth');
const reviewController = require('../controllers/reviewController.js');
const router = express.Router();

// Post a review
router.post('/', auth, reviewController.createReview);
// Get reviews for a user
router.get('/:userId', reviewController.getReviewsByUser);

module.exports = router; 