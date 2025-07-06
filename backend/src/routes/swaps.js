const express = require('express');
const auth = require('../middleware/auth');
const swapController = require('../controllers/swapController');
const router = express.Router();

// Propose a swap
router.post('/', auth, swapController.proposeSwap);
// Get all swaps for user
router.get('/', auth, swapController.getSwaps);
// Marketplace: Get all open swaps (must be before /:id)
router.get('/marketplace', async (req, res) => {
  const Swap = require('../models/Swap');
  try {
    const openSwaps = await Swap.find({ status: 'pending', receiver: null })
      .populate('sender', 'name avatar')
      .sort('-createdAt');
    res.json(openSwaps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Get open and accepted swaps for the logged-in user (must be before /:id)
router.get('/user-swaps', auth, swapController.getUserSwaps);
// Update swap status (accept, reject, complete)
router.put('/:id/status', auth, swapController.updateSwapStatus);
// Get swap by ID
router.get('/:id', auth, swapController.getSwapById);

module.exports = router; 