const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  swap: { type: mongoose.Schema.Types.ObjectId, ref: 'Swap', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  feedback: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema); 