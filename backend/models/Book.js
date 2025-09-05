const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    price: { type: String, required: true },
    stock: { type: String, required: true },
    rating: { type: String, required: true }, // Store as string (e.g., "Two"), convert to number for filtering
    thumbnailUrl: { type: String, required: true },
    cloudinaryUrl: { type: String, required: true },
    lastScraped: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Book', BookSchema);

