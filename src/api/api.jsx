// src/api/api.jsx (or api.js)
import axios from 'axios';

const API_BASE_URL = 'http://localhost/highschool-portal-api/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor (keep this part)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// --- Authentication Functions (Keep these) ---
export const login = async (username, password) => { /* ... (login logic) ... */ };
export const logout = () => { localStorage.clear(); /* ... */ };

// --- Data Fetching Functions (Keep these) ---
export const getAdminStats = () => { /* ... */ };
export const getStudents = () => { /* ... */ };
export const getStudentDashboardData = () => { /* ... */ };
export const getStudentCourses = () => { /* ... */ };

// 🛑 ADD THIS MISSING FUNCTION AND EXPORT 🛑
/**
 * Handles the API request to enroll a student in a course.
 * Corresponds to the logic in your original courses.php/enroll.php.
 */
export const enrollInCourse = async (courseId) => {
    try {
        // Assume your backend API has an enrollment endpoint
        const response = await api.post(`/student/enroll`, { course_id: courseId });
        return response.data;
    } catch (error) {
        // Throw an error message to be caught by the CourseCard component
        throw new Error(error.response?.data?.message || 'Enrollment failed due to server error.');
    }
};

export default api;