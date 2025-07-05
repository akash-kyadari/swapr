const mongoose = require('mongoose');

const SwapSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  offeredSkill: { type: [String], required: true },
  requestedSkill: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' },
  message: { type: String },
  chatRoomId: { type: String },
  difficultyLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Intermediate' },
  isUrgent: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Swap', SwapSchema); 