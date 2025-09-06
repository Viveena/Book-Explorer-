import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css'; // Import the main CSS file

// Rating map and renderStars helper function (if not already defined in App.jsx and shared)
// For now, let's assume App.jsx still has these or they are duplicated for simplicity in this file.
// In a real app, these would be in a shared utility file.
const ratingMap = {
    'One': 1,
    'Two': 2,
    'Three': 3,
    'Four': 4,
    'Five': 5
};

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

// BookDetailsPage Component
const BookDetailsPage = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBook = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`https://book-explorer-backend-c83o.onrender.com/api/books/${id}`);
                setBook(response.data);
            } catch (err) {
                setError('Failed to fetch book details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBook();
        }
    }, [id]);

    if (loading) return <div className="loading-message">Loading book details...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;
    if (!book) return <div className="no-book-message">Book not found.</div>;

    return (
        <div className="book-detail-container">
            <button onClick={() => navigate('/')} className="back-button">&larr; Back to Books</button>
            <div className="book-detail-card">
                <img
                    src={book.cloudinaryUrl}
                    alt={book.title}
                    className="book-detail-image"
                />
                <div className="book-detail-info">
                    <h1 className="book-detail-title">{book.title}</h1>
                    <p className="book-detail-price">{book.price}</p>
                    {renderStars(book.rating)}
                    <p className="book-detail-stock"><strong>Stock:</strong> {book.stock}</p>
                    <p className="book-detail-last-scraped">Last Scraped: {new Date(book.lastScraped).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
};

export default BookDetailsPage;


