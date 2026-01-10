const mongoose = require('mongoose');
require('dotenv').config();
const Recipe = require('./models/Recipe');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe-sharing';

// sample data
const sampleRecipes = [
  {
    title: 'Classic Chocolate Chip Cookies',
    category: 'Dessert',
    author: 'Sarah Johnson',
    ingredients: [
      '2 1/4 cups all-purpose flour',
      '1 tsp baking soda',
      '1 tsp salt',
      '1 cup butter, softened',
      '3/4 cup granulated sugar',
      '3/4 cup brown sugar',
      '2 large eggs',
      '2 tsp vanilla extract',
      '2 cups chocolate chips'
    ],
    steps: [
      'Preheat oven to 375°F (190°C).',
      'In a medium bowl, whisk together flour, baking soda, and salt.',
      'In a large bowl, cream together butter and both sugars until light and fluffy.',
      'Beat in eggs one at a time, then stir in vanilla.',
      'Gradually blend in flour mixture. Stir in chocolate chips.',
      'Drop rounded tablespoons of dough onto ungreased cookie sheets.',
      'Bake for 9-11 minutes or until golden brown. Cool on baking sheet for 2 minutes before removing.'
    ],
    ratings: [
      { userId: 'user1', rating: 5 },
      { userId: 'user2', rating: 4 },
      { userId: 'user3', rating: 5 }
    ],
    comments: [
      {
        author: 'Mike Thompson',
        text: 'Best chocolate chip cookies I\'ve ever made! My family loved them.',
        createdAt: new Date()
      },
      {
        author: 'Emma Wilson',
        text: 'Perfect texture and flavor. Will definitely make again!',
        createdAt: new Date()
      }
    ]
  },
  {
    title: 'Spaghetti Carbonara',
    category: 'Italian',
    author: 'Marco Rossi',
    ingredients: [
      '1 lb spaghetti',
      '8 oz pancetta or bacon, diced',
      '4 large eggs',
      '1 cup grated Parmesan cheese',
      '4 cloves garlic, minced',
      'Fresh black pepper',
      'Salt to taste'
    ],
    steps: [
      'Bring a large pot of salted water to boil and cook spaghetti according to package directions.',
      'Meanwhile, cook pancetta in a large skillet over medium heat until crispy.',
      'In a bowl, whisk together eggs and Parmesan cheese.',
      'Drain pasta, reserving 1 cup of pasta water.',
      'Add hot pasta to the skillet with pancetta, remove from heat.',
      'Quickly pour egg mixture over pasta, tossing constantly. Add pasta water as needed.',
      'Season with black pepper and serve immediately.'
    ],
    ratings: [
      { userId: 'user4', rating: 5 },
      { userId: 'user5', rating: 5 }
    ],
    comments: [
      {
        author: 'David Lee',
        text: 'Authentic Italian recipe! The trick is to remove from heat before adding eggs.',
        createdAt: new Date()
      }
    ]
  },
  {
    title: 'Chicken Tikka Masala',
    category: 'Indian',
    author: 'Priya Patel',
    ingredients: [
      '2 lbs chicken breast, cut into cubes',
      '1 cup plain yogurt',
      '2 tbsp lemon juice',
      '2 tsp ground cumin',
      '2 tsp paprika',
      '2 tsp garam masala',
      '1 can (14 oz) tomato sauce',
      '1 cup heavy cream',
      '1 large onion, diced',
      '4 cloves garlic, minced',
      '1 inch ginger, grated',
      'Salt and pepper to taste'
    ],
    steps: [
      'Marinate chicken in yogurt, lemon juice, and spices for at least 1 hour.',
      'Heat oil in a large pan and cook chicken until browned, about 5-7 minutes. Set aside.',
      'In the same pan, sauté onions until translucent. Add garlic and ginger, cook for 1 minute.',
      'Add tomato sauce and simmer for 10 minutes.',
      'Return chicken to pan, add cream, and simmer for 15 minutes.',
      'Season with salt and pepper. Serve over basmati rice or with naan.'
    ],
    ratings: [
      { userId: 'user6', rating: 5 },
      { userId: 'user7', rating: 4 },
      { userId: 'user8', rating: 5 }
    ],
    comments: [
      {
        author: 'James Anderson',
        text: 'This is restaurant-quality! The marinade makes all the difference.',
        createdAt: new Date()
      },
      {
        author: 'Lisa Chen',
        text: 'So flavorful and creamy. My kids asked for seconds!',
        createdAt: new Date()
      }
    ]
  },
  {
    title: 'Beef Tacos',
    category: 'Mexican',
    author: 'Carlos Mendoza',
    ingredients: [
      '1 lb ground beef',
      '1 packet taco seasoning',
      '8 taco shells',
      '1 cup shredded lettuce',
      '1 cup diced tomatoes',
      '1 cup shredded cheese',
      '1/2 cup sour cream',
      '1/4 cup diced onions',
      'Hot sauce (optional)'
    ],
    steps: [
      'Brown ground beef in a large skillet over medium-high heat.',
      'Add taco seasoning and follow package directions (usually add water and simmer).',
      'Warm taco shells according to package directions.',
      'Fill each shell with beef mixture.',
      'Top with lettuce, tomatoes, cheese, onions, and sour cream.',
      'Add hot sauce if desired and serve immediately.'
    ],
    ratings: [
      { userId: 'user9', rating: 4 },
      { userId: 'user10', rating: 5 }
    ],
    comments: [
      {
        author: 'Tom Brown',
        text: 'Quick and delicious weeknight dinner. Everyone loved it!',
        createdAt: new Date()
      }
    ]
  },
  {
    title: 'Vegetable Stir Fry',
    category: 'Vegetarian',
    author: 'Green Chef',
    ingredients: [
      '2 tbsp vegetable oil',
      '1 bell pepper, sliced',
      '1 cup broccoli florets',
      '1 carrot, julienned',
      '1 cup snap peas',
      '1 cup mushrooms, sliced',
      '3 cloves garlic, minced',
      '1 tbsp ginger, grated',
      '3 tbsp soy sauce',
      '1 tbsp sesame oil',
      '2 tsp cornstarch',
      '1/4 cup water'
    ],
    steps: [
      'Heat vegetable oil in a wok or large skillet over high heat.',
      'Add garlic and ginger, stir for 30 seconds.',
      'Add harder vegetables (carrots, broccoli) first, stir fry for 2 minutes.',
      'Add remaining vegetables and continue stir frying for 3-4 minutes.',
      'Mix soy sauce, sesame oil, cornstarch, and water in a bowl.',
      'Pour sauce over vegetables and toss until sauce thickens.',
      'Serve immediately over rice or noodles.'
    ],
    ratings: [
      { userId: 'user11', rating: 4 },
      { userId: 'user12', rating: 5 }
    ],
    comments: [
      {
        author: 'Anna Green',
        text: 'Perfect healthy dinner option! Very flavorful and easy to customize.',
        createdAt: new Date()
      }
    ]
  },
  {
    title: 'Classic Beef Burger',
    category: 'American',
    author: 'Grill Master',
    ingredients: [
      '1.5 lbs ground beef (80/20)',
      '1 tsp salt',
      '1/2 tsp black pepper',
      '1 tsp Worcestershire sauce',
      '4 burger buns',
      '4 slices cheese (your choice)',
      'Lettuce leaves',
      'Sliced tomatoes',
      'Sliced onions',
      'Pickles',
      'Ketchup and mustard'
    ],
    steps: [
      'In a bowl, gently mix ground beef with salt, pepper, and Worcestershire sauce. Don\'t overmix.',
      'Form into 4 equal patties, about 1 inch thick. Press a slight indentation in the center of each.',
      'Preheat grill or pan to medium-high heat.',
      'Cook burgers for 4-5 minutes per side for medium, or until desired doneness.',
      'Add cheese slices during the last minute of cooking.',
      'Toast burger buns lightly.',
      'Assemble burgers with your favorite toppings and condiments.'
    ],
    ratings: [
      { userId: 'user13', rating: 5 },
      { userId: 'user14', rating: 5 }
    ],
    comments: [
      {
        author: 'Chris Taylor',
        text: 'Juicy and flavorful! The Worcestershire sauce adds great depth.',
        createdAt: new Date()
      }
    ]
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // clear old recipes
    await Recipe.deleteMany({});
    console.log('Cleared existing recipes');

    // insert new ones
    const inserted = await Recipe.insertMany(sampleRecipes);
    console.log(`Added ${inserted.length} recipes`);

    // summary
    const categories = await Recipe.distinct('category');
    console.log(`\nCategories: ${categories.join(', ')}`);
    console.log(`Total recipes: ${inserted.length}`);
    
    const totalRatings = inserted.reduce((sum, r) => sum + (r.ratings?.length || 0), 0);
    const totalComments = inserted.reduce((sum, r) => sum + (r.comments?.length || 0), 0);
    console.log(`Ratings: ${totalRatings}`);
    console.log(`Comments: ${totalComments}`);

    await mongoose.connection.close();
    console.log('\nDone!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.name === 'MongoServerError') {
      console.error('Make sure MongoDB is running');
    }
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedDatabase();

