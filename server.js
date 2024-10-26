const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes')
const { PATHS } = require('./constants/path');
const errorMiddleware = require('./utils/errorMiddleware');
dotenv.config();

const app = express();

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors()); // Add this line
app.use(errorMiddleware);
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use(PATHS.USER.BASE, userRoutes);
app.use(PATHS.AUTH.BASE, authRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});