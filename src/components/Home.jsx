import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

const Home = () => {
    const navigate = useNavigate()

    const handleGetStarted = () => {
        navigate('/login')
    }

    const handleSignup = () => {
        navigate('/signup')
    }

    const handleLogin = () => {
        navigate('/login')
    }

    return (
        <div className="home-container">
            <header className="home-header">
                <nav className="navbar">
                    <div className="nav-brand">
                        <h1>EduPortal</h1>
                    </div>
                    <div className="nav-links">
                        <button onClick={handleLogin} className="login-btn">
                            Login
                        </button>
                    </div>
                </nav>
            </header>

            <main className="home-main">
                <section className="hero-section">
                    <div className="hero-content">
                        <h1>Welcome to School Management System</h1>
                        <p>
                            A comprehensive platform for students and teachers to manage 
                            academic activities, assessments, and communication seamlessly.
                        </p>
                        <div className="hero-buttons">
                            <button onClick={handleGetStarted} className="cta-button primary">
                                Get Started
                            </button>
                            <button onClick={handleSignup} className="cta-button secondary">
                                Sign Up as Student
                            </button>
                        </div>
                    </div>
                    <div className="hero-image">
                        <div className="placeholder-image">
                            🎓
                        </div>
                    </div>
                </section>
              
               
            </main>

            <footer className="home-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <h3>EduPortal</h3>
                            <p>Transforming education through technology and innovation.</p>
                        </div>
                        <div className="footer-section">
                            <h4>Quick Links</h4>
                            <ul>
                                <li><button onClick={() => navigate('/')}>Home</button></li>
                                <li><button onClick={handleLogin}>Login</button></li>
                                <li><button onClick={handleSignup}>Sign Up</button></li>
                            </ul>
                        </div>
                        <div className="footer-section">
                            <h4>Support</h4>
                            <ul>
                                <li><a href="#help">Help Center</a></li>
                                <li><a href="#contact">Contact Us</a></li>
                                <li><a href="#privacy">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2024 EduPortal. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Home