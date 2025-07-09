const mongoose = require('mongoose');

const SwapSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  offeredSkill: { type: [String], required: true },
  requestedSkill: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'in_progress', 'sender_completed', 'receiver_completed', 'completed', 'incomplete'], 
    default: 'pending' 
  },
  message: { type: String },
  acceptorMessage: { type: String }, // Message from acceptor about their requested part
  chatRoomId: { type: String },
  difficultyLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Intermediate' },
  isUrgent: { type: Boolean, default: false },
  
  // New fields for enhanced swap flow
  proposerDeadline: {
    type: Date,
    required: false, // Set by the proposer for their requested part
  },
  acceptorDeadline: {
    type: Date,
    required: false, // Set by the acceptor for their requested part
  },
  senderCompletedAt: { type: Date },
  receiverCompletedAt: { type: Date },
  senderApprovedAt: { type: Date },
  receiverApprovedAt: { type: Date },
  completedAt: { type: Date },
  
  // Completion tracking
  senderTaskCompleted: { type: Boolean, default: false },
  receiverTaskCompleted: { type: Boolean, default: false },
  senderApproved: { type: Boolean, default: false },
  receiverApproved: { type: Boolean, default: false },
  
  // Incomplete tracking
  incompleteReason: { type: String },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportedAt: { type: Date },
}, { timestamps: true });

// Virtual for checking if swap is overdue
SwapSchema.virtual('isOverdue').get(function() {
  const now = new Date();
  const currentUser = this.senderCompletedAt ? 'receiver' : 'sender';
  const deadline = currentUser === 'sender' ? this.proposerDeadline : this.acceptorDeadline;
  return deadline && now > deadline && !this[`${currentUser}TaskCompleted`];
});

// Virtual for getting time remaining
SwapSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  const currentUser = this.senderCompletedAt ? 'receiver' : 'sender';
  const deadline = currentUser === 'sender' ? this.proposerDeadline : this.acceptorDeadline;
  
  if (!deadline || this[`${currentUser}TaskCompleted`]) return null;
  
  const timeLeft = deadline - now;
  return timeLeft > 0 ? timeLeft : 0;
});

module.exports = mongoose.model('Swap', SwapSchema); 