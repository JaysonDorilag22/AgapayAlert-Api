const express = require('express');
const helmet = require('helmet');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes')
const feedbackRoutes = require('./routes/feedbackRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { PATHS } = require('./constants/path');
const errorMiddleware = require('./utils/errorMiddleware');
const { pipeline } = require('nodemailer/lib/xoauth2');
dotenv.config();

const app = express();
app.use(helmet());
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
app.use(PATHS.FEEDBACK.BASE, feedbackRoutes);
app.use(PATHS.REPORT.BASE, reportRoutes);
app.use(PATHS.NOTIFICATION.BASE, notificationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});