const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

const ratingMap = {
    'One': 1,
    'Two': 2,
    'Three': 3,
    'Four': 4,
    'Five': 5
};

// @route   GET /api/books
// @desc    Get all books with pagination, filtering, and searching
// @access  Public
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Filtering by rating
    if (req.query.rating) {
        const numericRating = ratingMap[req.query.rating];
        if (numericRating) {
            const ratingKeys = Object.keys(ratingMap).filter(key => ratingMap[key] >= numericRating);
            query.rating = { $in: ratingKeys };
        }
    }

    // Filtering by price range
    if (req.query.minPrice || req.query.maxPrice) {
        query.price = {};
        if (req.query.minPrice) {
            // Remove currency symbol and convert to float for comparison
            query.price.$gte = `£${parseFloat(req.query.minPrice).toFixed(2)}`;
        }
        if (req.query.maxPrice) {
            // Remove currency symbol and convert to float for comparison
            query.price.$lte = `£${parseFloat(req.query.maxPrice).toFixed(2)}`;
        }
    }

    // Filtering by in-stock status
    if (req.query.inStock) {
        query.stock = { $regex: /In stock/, $options: 'i' };
    }

    // Searching by title
    if (req.query.title) {
        query.title = { $regex: req.query.title, $options: 'i' }; // Case-insensitive search
    }

    try {
        const books = await Book.find(query)
                                .skip(skip)
                                .limit(limit);
        const totalBooks = await Book.countDocuments(query);

        res.json({
            currentPage: page,
            totalPages: Math.ceil(totalBooks / limit),
            totalBooks,
            books
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/books/:id
// @desc    Get single book by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ msg: 'Book not found' });
        }
        res.json(book);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Book not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;

