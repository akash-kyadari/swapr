const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const passport = require('./config/passport');

// Load env vars
const app = express();

// Middleware

app.use(cors({
  origin: process.env.FRONTEND_URL ,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Initialize Passport
app.use(passport.initialize());

// Placeholder routes
app.get('/', (req, res) => {
  res.send('SkillSwap API is running');
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/swaps', require('./routes/swaps'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/messages', require('./routes/messages'));

module.exports = app; 