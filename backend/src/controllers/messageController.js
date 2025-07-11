const Message = require('../models/Message');
const Swap = require('../models/Swap');
const { getIO } = require('../sockets/socketServer');

exports.sendMessage = async (req, res) => {
  try {
    const { swapId, content } = req.body;
    
    // Validate input
    if (!swapId || !content || !content.trim()) {
      return res.status(400).json({ message: 'Swap ID and message content are required' });
    }

    // Check if swap exists and user is part of it
    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Only allow messaging for accepted swaps
    if (swap.status !== 'in_progress' && swap.status !== 'sender_completed' && swap.status !== 'receiver_completed' && swap.status !== 'both_completed' && swap.status !== 'completed') {
      return res.status(403).json({ message: 'Can only message active swaps' });
    }

    // Check if user is part of this swap
    if (swap.sender.toString() !== req.user.id && swap.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to message this swap' });
    }

    const message = await Message.create({
      swap: swapId,
      sender: req.user.id,
      content: content.trim(),
    });

    // Populate sender info for immediate response
    await message.populate('sender', 'name avatar');

    // Emit to Socket.IO for real-time updates
    try {
      const io = getIO();
      io.to(`swap-${swapId}`).emit('new_message', message);
    } catch (socketError) {
      console.error('Socket.IO error:', socketError);
      // Continue even if Socket.IO fails
    }

    res.status(201).json(message);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { swapId } = req.params;
    
    // Check if swap exists and user is part of it
    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Check if user is part of this swap
    if (swap.sender.toString() !== req.user.id && swap.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view messages for this swap' });
    }

    const messages = await Message.find({ swap: swapId })
      .populate('sender', 'name avatar')
      .sort('createdAt');

    res.json(messages);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

// Get all swaps with messages for the current user
exports.getUserSwapsWithMessages = async (req, res) => {
  try {
    const swaps = await Swap.find({
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id }
      ],
      status: 'accepted'
    })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .sort('-updatedAt');

    // Get latest message for each swap
    const swapsWithLatestMessage = await Promise.all(
      swaps.map(async (swap) => {
        const latestMessage = await Message.findOne({ swap: swap._id })
          .populate('sender', 'name avatar')
          .sort('-createdAt')
          .limit(1);
        
        return {
          ...swap.toObject(),
          latestMessage: latestMessage || null
        };
      })
    );

    res.json(swapsWithLatestMessage);
  } catch (err) {
    console.error('Get user swaps with messages error:', err);
    res.status(500).json({ message: 'Failed to fetch swaps with messages' });
  }
}; 

// Mark all messages in a swap as seen by the current user
exports.markMessagesAsSeen = async (req, res) => {
  try {
    const { swapId } = req.params;
    const userId = req.user.id;

    // Check if swap exists and user is part of it
    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }
    if (swap.sender.toString() !== userId && swap.receiver.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update all messages in this swap not yet seen by this user
    await Message.updateMany(
      { swap: swapId, seenBy: { $ne: userId } },
      { $addToSet: { seenBy: userId } }
    );

    // Return updated messages
    const messages = await Message.find({ swap: swapId })
      .populate('sender', 'name avatar')
      .sort('createdAt');
    res.json(messages);
  } catch (err) {
    console.error('Mark messages as seen error:', err);
    res.status(500).json({ message: 'Failed to mark messages as seen' });
  }
};

// Get unread message count for a swap for the current user
exports.getUnreadCount = async (req, res) => {
  try {
    const { swapId } = req.params;
    const userId = req.user.id;

    // Check if swap exists and user is part of it
    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }
    if (swap.sender.toString() !== userId && swap.receiver.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Count messages not seen by this user
    const unreadCount = await Message.countDocuments({ swap: swapId, seenBy: { $ne: userId } });
    res.json({ unreadCount });
  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({ message: 'Failed to get unread count' });
  }
}; 