const express = require('express');
const auth = require('../middleware/auth');
const skillController = require('../controllers/skillController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// Create skill
router.post('/', auth, upload.single('image'), skillController.createSkill);
// Get all skills (with filters)
router.get('/', skillController.getSkills);
// Get skill by ID
router.get('/:id', skillController.getSkillById);
// Update skill
router.put('/:id', auth, upload.single('image'), skillController.updateSkill);
// Delete skill
router.delete('/:id', auth, skillController.deleteSkill);

module.exports = router; 