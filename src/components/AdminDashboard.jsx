import React, { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "./AdminDashboard.css"

export default function AdminDashboard() {
    const [activeLink, setActiveLink] = useState("dashboard")
    const [students, setStudents] = useState([])
    const [teachers, setTeachers] = useState([])
    const [courses, setCourses] = useState([])
    const [marks, setMarks] = useState([])
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [selectedTeacher, setSelectedTeacher] = useState(null)
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [showStudentModal, setShowStudentModal] = useState(false)
    const [showTeacherModal, setShowTeacherModal] = useState(false)
    const [showCourseModal, setShowCourseModal] = useState(false)
    const [showMarksModal, setShowMarksModal] = useState(false)
    const [formData, setFormData] = useState({})
    const [stats, setStats] = useState({})
    const navigate = useNavigate()

    const adminId = localStorage.getItem('user_id')
    const userType = localStorage.getItem('user_type')

    const [loading, setLoading] = useState({
        students: false,
        teachers: false,
        courses: false,
        marks: false,
        stats: false
    })

    // Redirect if not admin
    useEffect(() => {
        if (!adminId || userType !== 'admin') {
            navigate('/')
            return
        }
    }, [adminId, userType, navigate])

    // Fetch dashboard stats
    const fetchDashboardStats = async () => {
        setLoading(prev => ({ ...prev, stats: true }))
        try {
            const response = await axios.get('http://localhost/student_portal/admin_get_stats.php')
            if (response.data.success) {
                setStats(response.data.data)
            }
        } catch (error) {
            console.error("Error fetching stats:", error)
        } finally {
            setLoading(prev => ({ ...prev, stats: false }))
        }
    }

    // Fetch all students
    const fetchStudents = async () => {
        setLoading(prev => ({ ...prev, students: true }))
        try {
            const response = await axios.get('http://localhost/student_portal/admin_get_students.php')
            if (response.data.success) {
                setStudents(response.data.data || [])
            }
        } catch (error) {
            console.error("Error fetching students:", error)
        } finally {
            setLoading(prev => ({ ...prev, students: false }))
        }
    }

    // Fetch all teachers
    const fetchTeachers = async () => {
        setLoading(prev => ({ ...prev, teachers: true }))
        try {
            const response = await axios.get('http://localhost/student_portal/admin_get_teachers.php')
            if (response.data.success) {
                setTeachers(response.data.data || [])
            }
        } catch (error) {
            console.error("Error fetching teachers:", error)
        } finally {
            setLoading(prev => ({ ...prev, teachers: false }))
        }
    }

    // Fetch all courses
    const fetchCourses = async () => {
        setLoading(prev => ({ ...prev, courses: true }))
        try {
            const response = await axios.get('http://localhost/student_portal/admin_get_courses.php')
            if (response.data.success) {
                setCourses(response.data.data || [])
            }
        } catch (error) {
            console.error("Error fetching courses:", error)
        } finally {
            setLoading(prev => ({ ...prev, courses: false }))
        }
    }

    // Fetch all marks
    const fetchMarks = async () => {
        setLoading(prev => ({ ...prev, marks: true }))
        try {
            const response = await axios.get('http://localhost/student_portal/admin_get_marks.php')
            if (response.data.success) {
                setMarks(response.data.data || [])
            }
        } catch (error) {
            console.error("Error fetching marks:", error)
        } finally {
            setLoading(prev => ({ ...prev, marks: false }))
        }
    }

    // Load data based on active tab
    useEffect(() => {
        switch (activeLink) {
            case "dashboard":
                fetchDashboardStats()
                break
            case "students":
                fetchStudents()
                break
            case "teachers":
                fetchTeachers()
                break
            case "courses":
                fetchCourses()
                break
            case "marks":
                fetchMarks()
                break
        }
    }, [activeLink])

    const handleLogout = () => {
        localStorage.clear()
        navigate('/')
    }

    const handleAddStudent = () => {
        setFormData({})
        setShowStudentModal(true)
    }

    const handleAddTeacher = () => {
        setFormData({})
        setShowTeacherModal(true)
    }

    const handleAddCourse = () => {
        setFormData({})
        setShowCourseModal(true)
    }

    const handleAddMarks = () => {
        setFormData({})
        setShowMarksModal(true)
    }

    const handleEditStudent = (student) => {
        setFormData(student)
        setShowStudentModal(true)
    }

    const handleEditTeacher = (teacher) => {
        setFormData(teacher)
        setShowTeacherModal(true)
    }

    const handleEditCourse = (course) => {
        setFormData(course)
        setShowCourseModal(true)
    }

    const handleDeleteStudent = async (studentId) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                const response = await axios.post('http://localhost/student_portal/admin_delete_student.php', {
                    student_id: studentId
                })
                if (response.data.success) {
                    fetchStudents()
                }
            } catch (error) {
                console.error("Error deleting student:", error)
            }
        }
    }

    const handleDeleteTeacher = async (teacherId) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            try {
                const response = await axios.post('http://localhost/student_portal/admin_delete_teacher.php', {
                    teacher_id: teacherId
                })
                if (response.data.success) {
                    fetchTeachers()
                }
            } catch (error) {
                console.error("Error deleting teacher:", error)
            }
        }
    }

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                const response = await axios.post('http://localhost/student_portal/admin_delete_course.php', {
                    course_id: courseId
                })
                if (response.data.success) {
                    fetchCourses()
                }
            } catch (error) {
                console.error("Error deleting course:", error)
            }
        }
    }

    const handleFormSubmit = async (e, type) => {
        e.preventDefault()
        try {
            let response
            switch (type) {
                case 'student':
                    response = await axios.post('http://localhost/student_portal/admin_manage_student.php', formData)
                    if (response.data.success) {
                        setShowStudentModal(false)
                        fetchStudents()
                    }
                    break
                case 'teacher':
                    response = await axios.post('http://localhost/student_portal/admin_manage_teacher.php', formData)
                    if (response.data.success) {
                        setShowTeacherModal(false)
                        fetchTeachers()
                    }
                    break
                case 'course':
                    response = await axios.post('http://localhost/student_portal/admin_manage_course.php', formData)
                    if (response.data.success) {
                        setShowCourseModal(false)
                        fetchCourses()
                    }
                    break
                case 'marks':
                    response = await axios.post('http://localhost/student_portal/admin_manage_marks.php', formData)
                    if (response.data.success) {
                        setShowMarksModal(false)
                        fetchMarks()
                    }
                    break
            }
        } catch (error) {
            console.error(`Error saving ${type}:`, error)
        }
    }

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const renderDashboard = () => (
        <div className="dashboard-cards">
            <div className="stat-card">
                <div className="stat-icon">👨‍🎓</div>
                <div className="stat-info">
                    <h3>Total Students</h3>
                    <p className="stat-number">{stats.total_students || 0}</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">👨‍🏫</div>
                <div className="stat-info">
                    <h3>Total Teachers</h3>
                    <p className="stat-number">{stats.total_teachers || 0}</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-info">
                    <h3>Total Courses</h3>
                    <p className="stat-number">{stats.total_courses || 0}</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                    <h3>Total Marks Entries</h3>
                    <p className="stat-number">{stats.total_marks || 0}</p>
                </div>
            </div>
        </div>
    )

    const renderStudents = () => (
        <div className="card">
            <div className="card-header">
                <h2>Student Management</h2>
                <button onClick={handleAddStudent} className="add-btn">+ Add Student</button>
            </div>
            {loading.students ? (
                <div className="loading-section">Loading students...</div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Father Name</th>
                                <th>Grade</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.student_id}>
                                    <td>{student.student_id}</td>
                                    <td>{student.first_name} {student.last_name}</td>
                                    <td>{student.father_name}</td>
                                    <td>{student.grade}</td>
                                    <td>{student.email}</td>
                                    <td>{student.phone}</td>
                                    <td className="actions">
                                        <button onClick={() => handleEditStudent(student)} className="edit-btn">Edit</button>
                                        <button onClick={() => handleDeleteStudent(student.student_id)} className="delete-btn">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {students.length === 0 && (
                        <div className="no-data">No students found</div>
                    )}
                </div>
            )}
        </div>
    )

    const renderTeachers = () => (
        <div className="card">
            <div className="card-header">
                <h2>Teacher Management</h2>
                <button onClick={handleAddTeacher} className="add-btn">+ Add Teacher</button>
            </div>
            {loading.teachers ? (
                <div className="loading-section">Loading teachers...</div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Subject</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map(teacher => (
                                <tr key={teacher.teacher_id}>
                                    <td>{teacher.teacher_id}</td>
                                    <td>{teacher.first_name} {teacher.last_name}</td>
                                    <td>{teacher.email}</td>
                                    <td>{teacher.phone}</td>
                                    <td>{teacher.subject}</td>
                                    <td className="actions">
                                        <button onClick={() => handleEditTeacher(teacher)} className="edit-btn">Edit</button>
                                        <button onClick={() => handleDeleteTeacher(teacher.teacher_id)} className="delete-btn">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {teachers.length === 0 && (
                        <div className="no-data">No teachers found</div>
                    )}
                </div>
            )}
        </div>
    )

    const renderCourses = () => (
        <div className="card">
            <div className="card-header">
                <h2>Course Management</h2>
                <button onClick={handleAddCourse} className="add-btn">+ Add Course</button>
            </div>
            {loading.courses ? (
                <div className="loading-section">Loading courses...</div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Course Name</th>
                                <th>Course Code</th>
                                <th>Grade Level</th>
                                <th>Description</th>
                                <th>Teacher</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map(course => (
                                <tr key={course.course_id}>
                                    <td>{course.course_id}</td>
                                    <td>{course.course_name}</td>
                                    <td>{course.course_code}</td>
                                    <td>{course.grade_level}</td>
                                    <td>{course.description}</td>
                                    <td>{course.teacher_name}</td>
                                    <td className="actions">
                                        <button onClick={() => handleEditCourse(course)} className="edit-btn">Edit</button>
                                        <button onClick={() => handleDeleteCourse(course.course_id)} className="delete-btn">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {courses.length === 0 && (
                        <div className="no-data">No courses found</div>
                    )}
                </div>
            )}
        </div>
    )

    const renderMarks = () => (
        <div className="card">
            <div className="card-header">
                <h2>Marks Management</h2>
                <button onClick={handleAddMarks} className="add-btn">+ Add Marks</button>
            </div>
            {loading.marks ? (
                <div className="loading-section">Loading marks...</div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Course</th>
                                <th>Assessment Type</th>
                                <th>Marks</th>
                                <th>Total Marks</th>
                                <th>Date</th>
                                <th>Teacher</th>
                            </tr>
                        </thead>
                        <tbody>
                            {marks.map(mark => (
                                <tr key={mark.mark_id}>
                                    <td>{mark.student_name}</td>
                                    <td>{mark.course_name}</td>
                                    <td>{mark.assessment_type}</td>
                                    <td>{mark.marks}</td>
                                    <td>{mark.total_marks}</td>
                                    <td>{mark.date}</td>
                                    <td>{mark.teacher_name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {marks.length === 0 && (
                        <div className="no-data">No marks found</div>
                    )}
                </div>
            )}
        </div>
    )

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <div className="user-info">
                    <span>Welcome, Admin (ID: {adminId})</span>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            <div className="dashboard-content-wrapper">
                <aside className="sidebar">
                    <h2 className="sidebar-title">Admin Menu</h2>
                    <ul>
                        <li 
                            className={activeLink === "dashboard" ? "active" : ""} 
                            onClick={() => setActiveLink("dashboard")}
                        >
                            📊 Dashboard
                        </li>
                        <li 
                            className={activeLink === "students" ? "active" : ""} 
                            onClick={() => setActiveLink("students")}
                        >
                            👨‍🎓 Students
                        </li>
                        <li 
                            className={activeLink === "teachers" ? "active" : ""} 
                            onClick={() => setActiveLink("teachers")}
                        >
                            👨‍🏫 Teachers
                        </li>
                        <li 
                            className={activeLink === "courses" ? "active" : ""} 
                            onClick={() => setActiveLink("courses")}
                        >
                            📚 Courses
                        </li>
                        <li 
                            className={activeLink === "marks" ? "active" : ""} 
                            onClick={() => setActiveLink("marks")}
                        >
                            📊 Marks
                        </li>
                    </ul>
                </aside>

                <main className="content">
                    {activeLink === "dashboard" && renderDashboard()}
                    {activeLink === "students" && renderStudents()}
                    {activeLink === "teachers" && renderTeachers()}
                    {activeLink === "courses" && renderCourses()}
                    {activeLink === "marks" && renderMarks()}
                </main>
            </div>

            {/* Student Modal */}
            {showStudentModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{formData.student_id ? 'Edit Student' : 'Add Student'}</h2>
                            <button onClick={() => setShowStudentModal(false)} className="close-btn">×</button>
                        </div>
                        <form onSubmit={(e) => handleFormSubmit(e, 'student')}>
                            <div className="form-group">
                                <label>First Name:</label>
                                <input type="text" name="first_name" value={formData.first_name || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Last Name:</label>
                                <input type="text" name="last_name" value={formData.last_name || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Father Name:</label>
                                <input type="text" name="father_name" value={formData.father_name || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Grade:</label>
                                <input type="text" name="grade" value={formData.grade || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Phone:</label>
                                <input type="text" name="phone" value={formData.phone || ''} onChange={handleInputChange} />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="save-btn">Save</button>
                                <button type="button" onClick={() => setShowStudentModal(false)} className="cancel-btn">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Teacher Modal */}
            {showTeacherModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{formData.teacher_id ? 'Edit Teacher' : 'Add Teacher'}</h2>
                            <button onClick={() => setShowTeacherModal(false)} className="close-btn">×</button>
                        </div>
                        <form onSubmit={(e) => handleFormSubmit(e, 'teacher')}>
                            <div className="form-group">
                                <label>First Name:</label>
                                <input type="text" name="first_name" value={formData.first_name || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Last Name:</label>
                                <input type="text" name="last_name" value={formData.last_name || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Phone:</label>
                                <input type="text" name="phone" value={formData.phone || ''} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Subject:</label>
                                <input type="text" name="subject" value={formData.subject || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="save-btn">Save</button>
                                <button type="button" onClick={() => setShowTeacherModal(false)} className="cancel-btn">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Course Modal */}
            {showCourseModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{formData.course_id ? 'Edit Course' : 'Add Course'}</h2>
                            <button onClick={() => setShowCourseModal(false)} className="close-btn">×</button>
                        </div>
                        <form onSubmit={(e) => handleFormSubmit(e, 'course')}>
                            <div className="form-group">
                                <label>Course Name:</label>
                                <input type="text" name="course_name" value={formData.course_name || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Course Code:</label>
                                <input type="text" name="course_code" value={formData.course_code || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Grade Level:</label>
                                <input type="text" name="grade_level" value={formData.grade_level || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Description:</label>
                                <textarea name="description" value={formData.description || ''} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Teacher ID:</label>
                                <input type="number" name="teacher_id" value={formData.teacher_id || ''} onChange={handleInputChange} />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="save-btn">Save</button>
                                <button type="button" onClick={() => setShowCourseModal(false)} className="cancel-btn">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Marks Modal */}
            {showMarksModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add Marks</h2>
                            <button onClick={() => setShowMarksModal(false)} className="close-btn">×</button>
                        </div>
                        <form onSubmit={(e) => handleFormSubmit(e, 'marks')}>
                            <div className="form-group">
                                <label>Student ID:</label>
                                <input type="number" name="student_id" value={formData.student_id || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Course ID:</label>
                                <input type="number" name="course_id" value={formData.course_id || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Assessment Type:</label>
                                <input type="text" name="assessment_type" value={formData.assessment_type || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Marks:</label>
                                <input type="number" name="marks" value={formData.marks || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Total Marks:</label>
                                <input type="number" name="total_marks" value={formData.total_marks || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="save-btn">Save</button>
                                <button type="button" onClick={() => setShowMarksModal(false)} className="cancel-btn">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}