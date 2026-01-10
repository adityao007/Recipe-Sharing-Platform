# Recipe Sharing Platform

A recipe sharing app where you can browse, submit, rate and comment on recipes. Built with React, Node.js, Express, and MongoDB.

## Features

- Submit recipes with ingredients, steps, and category
- Browse recipes by category
- Rate recipes (1-5 stars)
- Comment on recipes
- Responsive design

## Tech Stack

- Frontend: React
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Styling: CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure MongoDB is running on your machine

3. (Optional) Seed the database:
```bash
npm run seed
```

## Running

### Development (separate ports)
```bash
npm run dev
```
- React: http://localhost:3000
- API: http://localhost:3001

### Production (single port)
```bash
npm run build
npm start
```
- App: http://localhost:3000

## Project Structure

```
├── client/           # React app
│   ├── src/
│   │   ├── App.js
│   │   └── App.css
├── models/          # Database models
│   └── Recipe.js
├── routes/          # API routes
│   ├── recipes.js
│   └── categories.js
├── server.js        # Express server
└── seed.js          # Database seeding
```

## API Endpoints

- GET /api/recipes - Get all recipes (optional ?category=)
- GET /api/recipes/:id - Get single recipe
- POST /api/recipes - Create recipe
- POST /api/recipes/:id/rate - Rate recipe
- POST /api/recipes/:id/comment - Add comment
- GET /api/categories - Get all categories

## Environment Variables

Create `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/recipe-sharing
PORT=3000
```
