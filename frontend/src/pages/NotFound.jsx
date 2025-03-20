// pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/NotFound.css';

const NotFound = () => {
    // Health and food safety quotes
    const healthQuotes = [
        "Let food be thy medicine and medicine be thy food. - Hippocrates",
        "The greatest wealth is health. - Virgil",
        "Healthy eating is a way of life, not a diet. - Unknown",
        "Food safety is everyone's responsibility. - FAO"
    ];

    return (
        <div className="not-found-container">
            <div className="error-content">
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <p>The page you're looking for doesn't exist. Here's some health wisdom instead:</p>

                <Link to="/" className="home-button">
                    Back to Home
                </Link>

                <div className="wisdom-section">
                    <h3>Health & Safety Wisdom</h3>
                    <ul>
                        {healthQuotes.map((quote, index) => (
                            <li key={index}>
                                <div className="quote-box">
                                    {quote}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NotFound;