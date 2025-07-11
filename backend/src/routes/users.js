const express = require('express');
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// Get current user's profile
router.get('/me', auth, userController.getProfile);
// Update profile (with optional avatar upload)
router.put('/me', auth, upload.single('avatar'), userController.updateProfile);
// Get user by ID
router.get('/:id', userController.getUserById);
// Update all users' stats (admin function)
router.post('/update-stats', userController.updateAllUserStats);
// Debug endpoint to check completed swaps count
router.get('/debug-completed-count', auth, userController.debugCompletedSwapsCount);

module.exports = router; 