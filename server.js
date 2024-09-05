const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const { PATHS } = require('./constants/path');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Connect to MongoDB
connectDB();

// Middleware for parsing JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Sample route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// User routes
app.use(PATHS.USER.BASE, userRoutes);

// Define your port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});