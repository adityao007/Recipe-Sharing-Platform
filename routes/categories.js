const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Recipe.distinct('category');
    const valid = categories.filter(cat => cat && cat.trim() !== '').sort();
    res.json(valid);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

