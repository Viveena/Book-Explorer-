import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../App.css'; // Import the main CSS file

// Rating map for converting string ratings to numbers for display
const ratingMap = {
    'One': 1,
    'Two': 2,
    'Three': 3,
    'Four': 4,
    'Five': 5
};

// Helper function to render star ratings
const renderStars = (rating) => {
    const numStars = ratingMap[rating];
    if (isNaN(numStars)) return null;
    return (
        <div className="star-rating">
            {[...Array(5)].map((_, i) => (
                <span key={i} className={i < numStars ? 'star-filled' : 'star-empty'}>&#9733;</span>
            ))}
        </div>
    );
};

// HomePage Component
const HomePage = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTitle, setSearchTitle] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');
    const [inStock, setInStock] = useState(false);

    const fetchBooks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page,
                limit: 10,
            };
            if (searchTitle) params.title = searchTitle;
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;
            if (ratingFilter) params.rating = ratingFilter;
            if (inStock) params.inStock = true;

            const response = await axios.get('http://localhost:5000/api/books', { params });
            setBooks(response.data.books);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            setError('Failed to fetch books.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, searchTitle, minPrice, maxPrice, ratingFilter, inStock]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    const handleSearchChange = (e) => {
        setSearchTitle(e.target.value);
        setPage(1);
    };

    const handleMinPriceChange = (e) => {
        setMinPrice(e.target.value);
        setPage(1);
    };

    const handleMaxPriceChange = (e) => {
        setMaxPrice(e.target.value);
        setPage(1);
    };

    const handleRatingFilterChange = (e) => {
        setRatingFilter(e.target.value);
        setPage(1);
    };

    const handleInStockChange = (e) => {
        setInStock(e.target.checked);
        setPage(1);
    };

    if (loading) return <div className="loading-message">Loading...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;

    return (
        <div className="home-page-container">
            <h1 className="main-title">Book Explorer</h1>

            <div className="filter-controls">
                <input
                    type="text"
                    placeholder="Search by title..."
                    className="filter-input"
                    value={searchTitle}
                    onChange={handleSearchChange}
                />
                <input
                    type="number"
                    placeholder="Min Price"
                    className="filter-input small-input"
                    value={minPrice}
                    onChange={handleMinPriceChange}
                />
                <input
                    type="number"
                    placeholder="Max Price"
                    className="filter-input small-input"
                    value={maxPrice}
                    onChange={handleMaxPriceChange}
                />
                <select
                    className="filter-select"
                    value={ratingFilter}
                    onChange={handleRatingFilterChange}
                >
                    <option value="">All Ratings</option>
                    <option value="One">One Star & Up</option>
                    <option value="Two">Two Stars & Up</option>
                    <option value="Three">Three Stars & Up</option>
                    <option value="Four">Four Stars & Up</option>
                    <option value="Five">Five Stars</option>
                </select>
                <label className="in-stock-label">
                    <input
                        type="checkbox"
                        className="in-stock-checkbox"
                        checked={inStock}
                        onChange={handleInStockChange}
                    />
                    <span>In Stock</span>
                </label>
            </div>

            <div className="book-grid">
                {books.length > 0 ? (
                    books.map(book => (
                        <Link to={`/book/${book._id}`} key={book._id} className="book-card-link">
                            <div className="book-card">
                                <img
                                    src={book.cloudinaryUrl}
                                    alt={book.title}
                                    className="book-thumbnail"
                                />
                                <div className="book-details">
                                    <h2 className="book-title">{book.title}</h2>
                                    <p className="book-price">{book.price}</p>
                                    {renderStars(book.rating)}
                                    <p className="book-stock">{book.stock}</p>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className="no-books-message">No books found matching your criteria.</p>
                )}
            </div>

            <div className="pagination-controls">
                <button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="pagination-button"
                >
                    Previous
                </button>
                <span className="page-info">Page {page} of {totalPages}</span>
                <button
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    className="pagination-button"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default HomePage;

