import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [activeTab, setActiveTab] = useState('browse');
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRecipes();
    fetchCategories();
  }, []);

  const fetchRecipes = async (category = '') => {
    try {
      setLoading(true);
      const url = category ? `${API_URL}/recipes?category=${category}` : `${API_URL}/recipes`;
      const response = await axios.get(url);
      setRecipes(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load recipes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategoryFilter = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory('');
      fetchRecipes();
    } else {
      setSelectedCategory(category);
      fetchRecipes(category);
    }
  };

  const handleRecipeClick = async (recipeId) => {
    try {
      const response = await axios.get(`${API_URL}/recipes/${recipeId}`);
      setSelectedRecipe(response.data);
      setActiveTab('detail');
    } catch (err) {
      setError('Could not load recipe');
      console.error(err);
    }
  };

  const handleRecipeSubmit = async (recipeData) => {
    try {
      await axios.post(`${API_URL}/recipes`, recipeData);
      setSuccess('Recipe added!');
      setActiveTab('browse');
      fetchRecipes(selectedCategory);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to submit recipe');
      console.error(err);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleBack = () => {
    setSelectedRecipe(null);
    setActiveTab('browse');
  };

  if (activeTab === 'detail' && selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onBack={handleBack}
        onUpdate={(updatedRecipe) => {
          setSelectedRecipe(updatedRecipe);
          fetchRecipes(selectedCategory);
        }}
        API_URL={API_URL}
      />
    );
  }

  return (
    <div className="app-container">
      <div className="header">
        <h1>Recipe Sharing Platform</h1>
        <p>Share and discover recipes</p>
      </div>

      <div className="content-container">
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            Browse Recipes
          </button>
          <button
            className={`nav-tab ${activeTab === 'submit' ? 'active' : ''}`}
            onClick={() => setActiveTab('submit')}
          >
            Submit Recipe
          </button>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {activeTab === 'browse' && (
          <BrowseRecipes
            recipes={recipes}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryFilter={handleCategoryFilter}
            onRecipeClick={handleRecipeClick}
            loading={loading}
          />
        )}

        {activeTab === 'submit' && (
          <RecipeForm onSubmit={handleRecipeSubmit} categories={categories} />
        )}
      </div>
    </div>
  );
}

function BrowseRecipes({ recipes, categories, selectedCategory, onCategoryFilter, onRecipeClick, loading }) {
  return (
    <div>
      {categories.length > 0 && (
        <div className="filter-section">
          <div className="filter-title">Categories:</div>
          <div className="category-filters">
            <button
              className={`category-filter ${selectedCategory === '' ? 'active' : ''}`}
              onClick={() => onCategoryFilter('')}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={`category-filter ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => onCategoryFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : recipes.length === 0 ? (
        <div className="empty-state">
          <h3>No recipes yet</h3>
          <p>Be the first to add one!</p>
        </div>
      ) : (
        <div className="recipes-grid">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe} onClick={() => onRecipeClick(recipe._id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecipeCard({ recipe, onClick }) {
  const avgRating = recipe.averageRating || 0;
  const ratingCount = recipe.ratings?.length || 0;

  return (
    <div className="recipe-card" onClick={onClick}>
      <h3>{recipe.title}</h3>
      <div className="recipe-meta">
        <span className="category-badge">{recipe.category}</span>
        <div className="rating">
          <span className="stars">{'★'.repeat(Math.round(avgRating))}</span>
          <span className="rating-value">{avgRating} ({ratingCount})</span>
        </div>
      </div>
      <div className="recipe-preview">
        <p><strong>Ingredients:</strong> {recipe.ingredients.slice(0, 3).join(', ')}
          {recipe.ingredients.length > 3 && '...'}</p>
      </div>
      <div className="recipe-info">
        <span className="recipe-author">By {recipe.author}</span>
        <span>{recipe.comments?.length || 0} comments</span>
      </div>
    </div>
  );
}

function RecipeForm({ onSubmit, categories }) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    author: '',
    ingredients: [''],
    steps: ['']
  });

  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[0] }));
    }
  }, [categories, formData.category]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData({ ...formData, steps: newSteps });
  };

  const addIngredient = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, ''] });
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData({ ...formData, ingredients: newIngredients });
    }
  };

  const addStep = () => {
    setFormData({ ...formData, steps: [...formData.steps, ''] });
  };

  const removeStep = (index) => {
    if (formData.steps.length > 1) {
      const newSteps = formData.steps.filter((_, i) => i !== index);
      setFormData({ ...formData, steps: newSteps });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const filteredIngredients = formData.ingredients.filter(ing => ing.trim() !== '');
    const filteredSteps = formData.steps.filter(step => step.trim() !== '');

    if (filteredIngredients.length === 0 || filteredSteps.length === 0) {
      alert('Need at least one ingredient and one step');
      return;
    }

    onSubmit({
      title: formData.title,
      category: formData.category,
      author: formData.author || 'Anonymous',
      ingredients: filteredIngredients,
      steps: filteredSteps
    });

    // reset form
    setFormData({
      title: '',
      category: categories[0] || '',
      author: '',
      ingredients: [''],
      steps: ['']
    });
  };

  return (
    <form className="recipe-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Recipe Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          placeholder="e.g., Chocolate Chip Cookies"
        />
      </div>

      <div className="form-group">
        <label>Category *</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          required
          list="categories-list"
          placeholder="Dessert, Italian, etc."
        />
        <datalist id="categories-list">
          {categories.map((cat) => (
            <option key={cat} value={cat} />
          ))}
        </datalist>
        {categories.length > 0 && (
          <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
            Suggestions: {categories.slice(0, 5).join(', ')}
          </small>
        )}
      </div>

      <div className="form-group">
        <label>Your Name</label>
        <input
          type="text"
          name="author"
          value={formData.author}
          onChange={handleInputChange}
          placeholder="Optional"
        />
      </div>

      <div className="form-group">
        <label>Ingredients *</label>
        <div className="ingredient-list">
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-item">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                placeholder={`Ingredient ${index + 1}`}
              />
              {formData.ingredients.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeIngredient(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" className="add-btn" onClick={addIngredient}>
          + Add Ingredient
        </button>
      </div>

      <div className="form-group">
        <label>Instructions *</label>
        <div className="step-list">
          {formData.steps.map((step, index) => (
            <div key={index} className="step-item">
              <textarea
                value={step}
                onChange={(e) => handleStepChange(index, e.target.value)}
                placeholder={`Step ${index + 1}`}
                rows="3"
              />
              {formData.steps.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeStep(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" className="add-btn" onClick={addStep}>
          + Add Step
        </button>
      </div>

      <button type="submit" className="submit-btn">
        Submit Recipe
      </button>
    </form>
  );
}

function RecipeDetail({ recipe, onBack, onUpdate, API_URL }) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentText, setCommentText] = useState('');
  const [userRating, setUserRating] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // check if user already rated
    const userId = localStorage.getItem('userId') || `user_${Date.now()}`;
    localStorage.setItem('userId', userId);
    
    const existingRating = recipe.ratings?.find(r => r.userId === userId);
    if (existingRating) {
      setUserRating(existingRating.rating);
      setSelectedRating(existingRating.rating);
    }
  }, [recipe]);

  const handleRate = async () => {
    if (selectedRating === 0) {
      setError('Select a rating first');
      return;
    }

    try {
      const userId = localStorage.getItem('userId') || `user_${Date.now()}`;
      localStorage.setItem('userId', userId);
      
      const response = await axios.post(`${API_URL}/recipes/${recipe._id}/rate`, {
        userId,
        rating: selectedRating
      });
      setSuccess('Rating saved!');
      setError('');
      setUserRating(selectedRating);
      onUpdate(response.data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to submit rating');
      console.error(err);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentAuthor.trim() || !commentText.trim()) {
      setError('Fill in both fields');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/recipes/${recipe._id}/comment`, {
        author: commentAuthor,
        text: commentText
      });
      setSuccess('Comment added!');
      setError('');
      setCommentAuthor('');
      setCommentText('');
      onUpdate(response.data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add comment');
      console.error(err);
      setTimeout(() => setError(''), 3000);
    }
  };

  const avgRating = recipe.averageRating || 0;
  const ratingCount = recipe.ratings?.length || 0;

  return (
    <div className="app-container">
      <div className="content-container">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="recipe-detail">
          <h2>{recipe.title}</h2>
          
          <div className="detail-meta">
            <div>
              <span className="category-badge">{recipe.category}</span>
              <span style={{ marginLeft: '15px', color: '#666' }}>
                By {recipe.author}
              </span>
            </div>
            <div className="rating">
              <span className="stars">{'★'.repeat(Math.round(avgRating))}</span>
              <span className="rating-value">
                {avgRating} ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
              </span>
            </div>
          </div>

          <div className="ingredients-section">
            <h3 className="section-title">Ingredients</h3>
            <ul className="ingredients-list">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

          <div className="steps-section">
            <h3 className="section-title">Instructions</h3>
            <ol className="steps-list">
              {recipe.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="rating-section">
            <h3 className="section-title">Rate this Recipe</h3>
            {userRating && (
              <p style={{ color: '#666', marginBottom: '20px' }}>
                You rated {userRating} stars. Click to change.
              </p>
            )}
            <div className="rating-controls">
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`rating-star ${
                      star <= (hoverRating || selectedRating) ? 'active' : ''
                    }`}
                    onClick={() => setSelectedRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <button className="rate-btn" onClick={handleRate}>
                {userRating ? 'Update Rating' : 'Submit Rating'}
              </button>
            </div>
          </div>

          <div className="comments-section">
            <h3 className="section-title">
              Comments ({recipe.comments?.length || 0})
            </h3>

            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <div className="comment-input-group">
                <input
                  type="text"
                  placeholder="Your name"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  required
                />
              </div>
              <textarea
                className="comment-textarea"
                placeholder="Your comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
              />
              <button type="submit" className="comment-submit-btn">
                Add Comment
              </button>
            </form>

            {recipe.comments && recipe.comments.length > 0 ? (
              <ul className="comments-list">
                {recipe.comments
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((comment, index) => (
                    <li key={index} className="comment-item">
                      <div className="comment-author">{comment.author}</div>
                      <div className="comment-text">{comment.text}</div>
                      <div className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                No comments yet. Be the first!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
