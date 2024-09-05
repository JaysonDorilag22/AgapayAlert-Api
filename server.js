const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const { PATHS } = require('./constants/path');

dotenv.config();

const app = express();

connectDB();

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use(PATHS.USER.BASE, userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});