const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String }, // Cloudinary URL
  type: { type: String, enum: ['Design', 'Development', 'Writing', 'Marketing', 'Other'], required: true },
  remote: { type: Boolean, default: true },
  availability: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Skill', SkillSchema); 