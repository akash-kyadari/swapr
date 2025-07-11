const express = require('express');
const auth = require('../middleware/auth');
const messageController = require('../controllers/messageController');
const router = express.Router();

// Get all swaps with messages for current user
router.get('/user-swaps', auth, messageController.getUserSwapsWithMessages);
// Send a message
router.post('/', auth, messageController.sendMessage);
// Get messages for a swap
router.get('/:swapId', auth, messageController.getMessages);
// Mark all messages in a swap as seen
router.patch('/:swapId/seen', auth, messageController.markMessagesAsSeen);
// Get unread message count for a swap
router.get('/:swapId/unread-count', auth, messageController.getUnreadCount);

module.exports = router; 