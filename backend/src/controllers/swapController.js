const Swap = require('../models/Swap');
const User = require('../models/User');

exports.proposeSwap = async (req, res) => {
  try {
    const { offeredSkill, requestedSkill, message, difficultyLevel, isUrgent, proposerDeadline } = req.body;
    if (!offeredSkill || !requestedSkill || !proposerDeadline) {
      return res.status(400).json({ message: 'offeredSkill, requestedSkill, and proposerDeadline are required' });
    }
    
    // Validate deadline is in the future
    const deadline = new Date(proposerDeadline);
    const now = new Date();
    if (deadline <= now) {
      return res.status(400).json({ message: 'Deadline must be in the future' });
    }
    
    // Validate offeredSkill matches user's skillsOffered
    const user = await User.findById(req.user.id);
    const userSkills = Array.isArray(user.skillsOffered) ? user.skillsOffered : [];
    const offeredSkillsArray = Array.isArray(offeredSkill) ? offeredSkill : [offeredSkill];
    const invalidSkills = offeredSkillsArray.filter(skill => !userSkills.includes(skill));
    if (invalidSkills.length > 0) {
      return res.status(400).json({ message: `You can only offer your own skills. Invalid: ${invalidSkills.join(', ')}` });
    }
    
    const swap = await Swap.create({
      sender: req.user.id,
      offeredSkill,
      requestedSkill,
      message,
      difficultyLevel: difficultyLevel || 'Intermediate',
      isUrgent: isUrgent || false,
      proposerDeadline: deadline, // When the proposer wants their requested part completed
      status: 'pending',
    });
    // Emit global event for new swap
    try {
      const { getIO } = require('../sockets/socketServer');
      const io = getIO();
      await swap.populate('sender', 'name avatar');
      io.emit('swap_created', swap);
    } catch (socketError) {
      console.error('Socket.IO error:', socketError);
    }
    res.status(201).json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSwaps = async (req, res) => {
  try {
    const { status, role } = req.query;
    let filter = {};
    if (role === 'sent') {
      filter.sender = req.user.id;
    } else if (role === 'received') {
      filter.receiver = req.user.id;
    } else {
      filter.$or = [ { sender: req.user.id }, { receiver: req.user.id } ];
    }
    if (status) {
      filter.status = status;
    }
    const swaps = await Swap.find(filter)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');
    res.json(swaps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSwapStatus = async (req, res) => {
  try {
    const { status, deadline, approval, acceptorMessage } = req.body;
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    
    // Handle acceptance with deadline
    if (status === 'accepted') {
      if (swap.status !== 'pending' || swap.receiver) {
        return res.status(400).json({ message: 'Swap already accepted or not open' });
      }
      if (String(swap.sender) === req.user.id) {
        return res.status(403).json({ message: 'Cannot accept your own swap' });
      }
      if (!deadline) {
        return res.status(400).json({ message: 'Deadline is required when accepting a swap' });
      }
      if (!acceptorMessage || !acceptorMessage.trim()) {
        return res.status(400).json({ message: 'Please provide a description of what you need' });
      }
      
      swap.receiver = req.user.id;
      swap.acceptorDeadline = new Date(deadline); // When the acceptor wants their requested part completed
      swap.acceptorMessage = acceptorMessage.trim(); // Message from acceptor about their requested part
      swap.status = 'in_progress';
      await swap.save();
      await swap.populate('sender', 'name avatar');
      await swap.populate('receiver', 'name avatar');
      
      // Emit socket event for real-time updates
      try {
        const { getIO } = require('../sockets/socketServer');
        const io = getIO();
        io.to(`swap-${swap._id}`).emit('swap_updated', swap);
        io.emit('swap_accepted', swap); // Global event for all clients
      } catch (socketError) {
        console.error('Socket.IO error:', socketError);
      }
      
      return res.json(swap);
    }
    
    // Handle task completion
    if (status === 'task_completed') {
      const isSender = String(swap.sender) === req.user.id;
      const isReceiver = String(swap.receiver) === req.user.id;
      
      if (!isSender && !isReceiver) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const userRole = isSender ? 'sender' : 'receiver';
      const otherRole = isSender ? 'receiver' : 'sender';
      
      // Mark task as completed
      swap[`${userRole}TaskCompleted`] = true;
      swap[`${userRole}CompletedAt`] = new Date();
      
      // Update status based on completion state
      if (swap[`${otherRole}TaskCompleted`]) {
        // Both tasks completed, wait for approvals
        swap.status = 'both_completed';
      } else {
        // First task completed
        swap.status = userRole === 'sender' ? 'sender_completed' : 'receiver_completed';
      }
      
      await swap.save();
      await swap.populate('sender', 'name avatar');
      await swap.populate('receiver', 'name avatar');
      
      // Emit socket event for real-time updates
      try {
        const { getIO } = require('../sockets/socketServer');
        const io = getIO();
        io.to(`swap-${swap._id}`).emit('swap_updated', swap);
        if (swap.status === 'completed') {
          io.emit('swap_completed', swap); // Global event for all clients
        }
      } catch (socketError) {
        console.error('Socket.IO error:', socketError);
      }
      
      return res.json(swap);
    }
    
    // Handle task approval
    if (approval === 'approve') {
      const isSender = swap.sender && swap.sender.toString() === req.user.id;
      const isReceiver = swap.receiver && swap.receiver.toString() === req.user.id;

      if (!isSender && !isReceiver) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const userRole = isSender ? 'sender' : 'receiver';
      const otherRole = isSender ? 'receiver' : 'sender';

      // Check if other user's task is completed
      if (!swap[`${otherRole}TaskCompleted`]) {
        return res.status(400).json({ message: 'Cannot approve before other user completes their task' });
      }

      // Mark the OTHER person's work as approved (not your own)
      swap[`${otherRole}Approved`] = true;
      swap[`${otherRole}ApprovedAt`] = new Date();

      // Check if both approved
      if (swap[`${userRole}Approved`]) {
        console.log(`Both users approved swap ${swap._id}, marking as completed`);
        swap.status = 'completed';
        swap.completedAt = new Date();
        
        // Save the swap first with completed status
        await swap.save();
        
        // Update completed swaps count for both users using utility function
        const { updateUserStats } = require('./userController');
        try {
          console.log(`Updating user stats for swap ${swap._id}: sender ${swap.sender}, receiver ${swap.receiver}`);
          const senderStats = await updateUserStats(swap.sender);
          const receiverStats = await updateUserStats(swap.receiver);
          console.log(`Updated user stats after swap completion: sender ${swap.sender} ->`, senderStats, 'receiver', swap.receiver, '->', receiverStats);
        } catch (err) {
          console.error('Error updating user stats after swap completion:', err);
        }
        
        // When swap is completed, both users can rate each other
        swap.senderCanRateReceiver = true;
        swap.receiverCanRateSender = true;
        console.log(`Swap completed! Both users can now rate each other for swap ${swap._id}`);
      } else {
        // Only one person has approved, enable rating for the person who just approved
        if (userRole === 'sender') {
          // Sender approved receiver's work, so sender can now rate receiver
          swap.senderCanRateReceiver = true;
          console.log(`Sender can now rate receiver after approving their work for swap ${swap._id}`);
        } else {
          // Receiver approved sender's work, so receiver can now rate sender
          swap.receiverCanRateSender = true;
          console.log(`Receiver can now rate sender after approving their work for swap ${swap._id}`);
        }
      }

      // Always save the swap after setting canRate flag
      await swap.save();
      await swap.populate('sender', 'name avatar');
      await swap.populate('receiver', 'name avatar');
      
      // Emit socket event for real-time updates
      try {
        const { getIO } = require('../sockets/socketServer');
        const io = getIO();
        io.to(`swap-${swap._id}`).emit('swap_updated', swap);
        if (swap.status === 'completed') {
          io.emit('swap_completed', swap); // Global event for all clients
        }
      } catch (socketError) {
        console.error('Socket.IO error:', socketError);
      }
      return res.json(swap);
    }
    
    // Handle rejection
    if (["rejected"].includes(status) && String(swap.receiver) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Handle reporting incomplete
    if (status === 'incomplete') {
      const isSender = String(swap.sender) === req.user.id;
      const isReceiver = String(swap.receiver) === req.user.id;
      
      if (!isSender && !isReceiver) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      swap.status = 'incomplete';
      swap.reportedBy = req.user.id;
      swap.reportedAt = new Date();
      swap.incompleteReason = req.body.reason || 'No reason provided';
      
      await swap.save();
      await swap.populate('sender', 'name avatar');
      await swap.populate('receiver', 'name avatar');
      return res.json(swap);
    }
    
    // Legacy status updates (for backward compatibility)
    if (status === 'completed' && ![swap.sender.toString(), swap.receiver?.toString()].includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    swap.status = status;
    await swap.save();
    await swap.populate('sender', 'name avatar');
    await swap.populate('receiver', 'name avatar');
    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSwapById = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id)
      .populate('sender', 'name avatar rating completedSwapsCount')
      .populate('receiver', 'name avatar rating completedSwapsCount');
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    
    // Ensure rating flags are included in the response
    const swapData = swap.toObject();
    swapData.senderCanRateReceiver = swap.senderCanRateReceiver || false;
    swapData.receiverCanRateSender = swap.receiverCanRateSender || false;
    
    res.json(swapData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserSwaps = async (req, res) => {
  try {
    const userId = req.user.id;
    // Open swaps proposed by the user
    const openSwaps = await Swap.find({ sender: userId, status: 'pending', receiver: null })
      .populate('sender', 'name avatar rating completedSwapsCount')
      .sort('-createdAt');
    // Active swaps where user is sender or receiver
    const activeSwaps = await Swap.find({ 
      status: { $in: ['in_progress', 'sender_completed', 'receiver_completed', 'both_completed'] }, 
      $or: [ { sender: userId }, { receiver: userId } ] 
    })
      .populate('sender', 'name avatar rating completedSwapsCount')
      .populate('receiver', 'name avatar rating completedSwapsCount')
      .sort('-updatedAt');
    // Completed swaps
    const completedSwaps = await Swap.find({ 
      status: 'completed', 
      $or: [ { sender: userId }, { receiver: userId } ] 
    })
      .populate('sender', 'name avatar rating completedSwapsCount')
      .populate('receiver', 'name avatar rating completedSwapsCount')
      .sort('-completedAt');
    res.json({ openSwaps, activeSwaps, completedSwaps });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 