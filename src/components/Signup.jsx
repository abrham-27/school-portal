import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import './Signup.css'

const API_BASE = 'http://localhost/student_portal'

const Signup = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        father_name: '',
        grandfather_name: '',
        grade: '',
        email: '',
        user_number: '',
        password: '',
        confirm_password: '',
        role: 'student' // Default role is student
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        setError('')
    }

    const validateForm = () => {
        if (!formData.first_name || !formData.father_name || !formData.grandfather_name) {
            setError('Please fill in all name fields')
            return false
        }
        if (!formData.grade) {
            setError('Please select a grade')
            return false
        }
        if (!formData.user_number) {
            setError('Student ID is required')
            return false
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long')
            return false
        }
        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match')
            return false
        }
        return true
    }

    const generateStudentId = () => {
        const randomNum = Math.floor(1000 + Math.random() * 9000)
        setFormData(prev => ({
            ...prev,
            user_number: `S${randomNum}`
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!validateForm()) {
            return
        }

        setLoading(true)

        try {
            const response = await axios.post(`${API_BASE}/signup.php`, formData)
            
            if (response.data.success) {
                const userRole = response.data.user_type || formData.role

                // Store user info in localStorage if provided by backend
                if (response.data.user_id) {
                    localStorage.setItem('user_id', response.data.user_id)
                }
                if (userRole) {
                    localStorage.setItem('user_type', userRole)
                }
                
                setSuccess('Account created successfully! Redirecting...')
                
                // Redirect based on user role
                setTimeout(() => {
                    if (userRole === 'student') {
                        navigate('/student-dashboard')
                    } else if (userRole === 'teacher') {
                        navigate('/teacher-dashboard')
                    } else if (userRole === 'admin') {
                        navigate('/admin-dashboard')
                    } else {
                        navigate('/student-dashboard')
                    }
                }, 1200)
            } else {
                setError(response.data.message)
            }
        } catch (error) {
            setError('Signup failed. Please try again.')
            console.error('Signup error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="signup-container">
            <div className="signup-form">
                <div className="signup-header">
                    <Link to="/" className="back-home">
                        ← Back to Home
                    </Link>
                    <h2>Create Student Account</h2>
                    <p>Fill in your details to create a new account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>First Name *</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                                placeholder="Enter your first name"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Father's Name *</label>
                            <input
                                type="text"
                                name="father_name"
                                value={formData.father_name}
                                onChange={handleChange}
                                required
                                placeholder="Enter father's name"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Grandfather's Name *</label>
                            <input
                                type="text"
                                name="grandfather_name"
                                value={formData.grandfather_name}
                                onChange={handleChange}
                                required
                                placeholder="Enter grandfather's name"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Grade *</label>
                            <select
                                name="grade"
                                value={formData.grade}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Grade</option>
                                <option value="9">Grade 9</option>
                                <option value="10">Grade 10</option>
                                <option value="11">Grade 11</option>
                                <option value="12">Grade 12</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email address (optional)"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Student ID *</label>
                            <div className="student-id-input">
                                <input
                                    type="text"
                                    name="user_number"
                                    value={formData.user_number}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., S1001"
                                />
                                <button 
                                    type="button" 
                                    className="generate-btn"
                                    onClick={generateStudentId}
                                >
                                    Generate
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Password *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter password (min. 6 characters)"
                                minLength="6"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Confirm Password *</label>
                            <input
                                type="password"
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                required
                                placeholder="Confirm your password"
                            />
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    
                    <button type="submit" disabled={loading} className="signup-btn">
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="signup-footer">
                    <p>
                        Already have an account? <Link to="/login">Sign in here</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Signup