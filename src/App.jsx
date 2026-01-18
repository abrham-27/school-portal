import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/Home'
import Signup from './components/Signup'
import Login from './components/Login'
import StudentDashboard from './components/StudentDashboard'
import TeacherDashboard from './components/TeacherDashboard'
import AdminDashboard from './components/AdminDashboard'
import './App.css'

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/student-dashboard" element={<StudentDashboard />} />
                    <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App