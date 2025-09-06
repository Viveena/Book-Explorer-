require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bookRoutes = require('./routes/bookRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    "https://book-explorer-frontend-4ek8.onrender.com", // your Render frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

// ✅ Use ONLY this line
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error(err));

// Routes
app.use('/api/books', bookRoutes);

app.get('/', (req, res) => {
    res.send('Book-Explorer Backend API');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
