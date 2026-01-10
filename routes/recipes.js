const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Recipe = require('../models/Recipe');

// get all recipes, filter by category if provided
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category) {
      query = { category };
    }
    const recipes = await Recipe.find(query).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get single recipe
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// create recipe
router.post('/', async (req, res) => {
  try {
    const { title, category, ingredients, steps, author } = req.body;
    
    if (!title || !category || !ingredients || !steps) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // clean up arrays, remove empty ones
    let ingredientsArray = Array.isArray(ingredients) ? ingredients : [ingredients];
    ingredientsArray = ingredientsArray.filter(ing => ing && ing.trim() !== '');
    
    let stepsArray = Array.isArray(steps) ? steps : [steps];
    stepsArray = stepsArray.filter(step => step && step.trim() !== '');

    if (ingredientsArray.length === 0 || stepsArray.length === 0) {
      return res.status(400).json({ error: 'Need at least 1 ingredient and 1 step' });
    }

    const recipe = new Recipe({
      title: title.trim(),
      category: category.trim(),
      ingredients: ingredientsArray.map(ing => ing.trim()),
      steps: stepsArray.map(step => step.trim()),
      author: author ? author.trim() : 'Anonymous'
    });

    const saved = await recipe.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// add rating
router.post('/:id/rate', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const { userId, rating } = req.body;
    
    if (!userId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating' });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Not found' });
    }

    // remove old rating from same user if exists
    recipe.ratings = recipe.ratings.filter(r => r.userId !== userId);
    recipe.ratings.push({ userId, rating });
    await recipe.save();

    res.json(recipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// add comment
router.post('/:id/comment', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const { author, text } = req.body;
    
    if (!author || !text) {
      return res.status(400).json({ error: 'Need author and text' });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Not found' });
    }

    recipe.comments.push({ author: author.trim(), text: text.trim() });
    await recipe.save();

    res.json(recipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

