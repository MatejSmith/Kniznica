const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const booksRoutes = require('./routes/booksRoutes');
const reviewsRoutes = require('./routes/reviewsRoutes');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/reviews', reviewsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server beží na porte ${PORT}`);
});