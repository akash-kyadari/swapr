const Skill = require('../models/Skill');
const cloudinary = require('../config/cloudinary');

exports.createSkill = async (req, res) => {
  try {
    const { title, description, type, remote, availability } = req.body;
    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'skills' });
      imageUrl = result.secure_url;
    }
    const skill = await Skill.create({
      user: req.user.id,
      title,
      description,
      type,
      remote,
      availability,
      image: imageUrl,
    });
    res.status(201).json(skill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSkills = async (req, res) => {
  try {
    const { type, remote, availability } = req.query;
    let filter = {};
    if (type) filter.type = type;
    if (remote !== undefined) filter.remote = remote === 'true';
    if (availability) filter.availability = availability;
    const skills = await Skill.find(filter).populate('user', 'name avatar');
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id).populate('user', 'name avatar');
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    res.json(skill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSkill = async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'skills' });
      updates.image = result.secure_url;
    }
    const skill = await Skill.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(skill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSkill = async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 