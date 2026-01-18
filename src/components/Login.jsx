import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const API_BASE = 'http://localhost/student_portal';

export default function Login() {
    const [formData, setFormData] = useState({
        user_number: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE}/login.php`, formData);
            
            if (response.data.success) {
                const userRole = response.data.user_type;

                // Persist user info for later use
                if (response.data.user_id) {
                    localStorage.setItem('user_id', response.data.user_id);
                }
                if (userRole) {
                    localStorage.setItem('user_type', userRole);
                }

                if (userRole === 'student') {
                    navigate('/student-dashboard');
                } else if (userRole === 'teacher') {
                    navigate('/teacher-dashboard');
                } else if (userRole === 'admin') {
                    navigate('/admin-dashboard');
                } else {
                    setError('Unknown user role. Please contact support.');
                }
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError("System error. Please try again.");
        } finally {
            setLoading(false);
        }
    };
        

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>School Portal Login</h1>
                
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>User Number (Student ID):</label>
                        <input
                            type="text"
                            name="user_number"
                            value={formData.user_number}
                            onChange={handleChange}
                            required
                            placeholder="Enter your ID"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" disabled={loading} className="login-btn">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>New student? <Link to="/signup" className="signup-link">Register here</Link></p>
                </div>
            </div>
        </div>
    );
}