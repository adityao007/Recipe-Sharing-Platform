const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// setup cors and body parser
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// connect to mongo
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe-sharing';

mongoose.connect(MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB error:', err.message);
  console.log('Server will run but db stuff wont work');
});

// routes
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/categories', require('./routes/categories'));

// serve react build files
const buildPath = path.join(__dirname, 'client/build');

if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  
  // catch all route for react router
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(buildPath, 'index.html'), (err) => {
      if (err) {
        res.status(500).send('Error loading page');
      }
    });
  });
} else {
  // no build folder yet
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.send(`
      <html>
        <head><title>Recipe App</title></head>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h1>Recipe Sharing Platform</h1>
          <p>Need to build first:</p>
          <pre style="background: #f0f0f0; padding: 20px;">npm run build</pre>
          <p>Or dev mode:</p>
          <pre>npm run dev</pre>
        </body>
      </html>
    `);
  });
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

