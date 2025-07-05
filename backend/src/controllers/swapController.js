const Swap = require('../models/Swap');
const User = require('../models/User');

exports.proposeSwap = async (req, res) => {
  try {
    const { offeredSkill, requestedSkill, message, difficultyLevel, isUrgent } = req.body;
    if (!offeredSkill || !requestedSkill) {
      return res.status(400).json({ message: 'offeredSkill and requestedSkill are required' });
    }
    const swap = await Swap.create({
      sender: req.user.id,
      offeredSkill,
      requestedSkill,
      message,
      difficultyLevel: difficultyLevel || 'Intermediate',
      isUrgent: isUrgent || false,
      status: 'pending',
    });
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
    const { status } = req.body;
    const swap = await Swap.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    // Only receiver can accept/reject, both can mark as completed
    if (status === 'accepted') {
      if (swap.status !== 'pending' || swap.receiver) {
        return res.status(400).json({ message: 'Swap already accepted or not open' });
      }
      // Set receiver to current user
      if (String(swap.sender) === req.user.id) {
        return res.status(403).json({ message: 'Cannot accept your own swap' });
      }
      swap.receiver = req.user.id;
      swap.status = 'accepted';
      await swap.save();
      return res.json(swap);
    }
    if (["rejected"].includes(status) && String(swap.receiver) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (status === 'completed' && ![swap.sender.toString(), swap.receiver?.toString()].includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    swap.status = status;
    await swap.save();
    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSwapById = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserSwaps = async (req, res) => {
  try {
    const userId = req.user.id;
    // Open swaps proposed by the user
    const openSwaps = await Swap.find({ sender: userId, status: 'pending', receiver: null })
      .populate('sender', 'name avatar')
      .sort('-createdAt');
    // Accepted swaps where user is sender or receiver
    const acceptedSwaps = await Swap.find({ status: 'accepted', $or: [ { sender: userId }, { receiver: userId } ] })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort('-updatedAt');
    res.json({ openSwaps, acceptedSwaps });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 