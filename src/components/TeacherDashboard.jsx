import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './TeacherDashboard.css'

const TeacherDashboard = () => {
    const navigate = useNavigate()
    const teacherName = localStorage.getItem('user_name') || 'Teacher'
    const teacherId = localStorage.getItem('user_id')
    const teacherSubject = localStorage.getItem('user_subject') || 'Mathematics'
    const [showInsertForm, setShowInsertForm] = useState(false)
    const [students, setStudents] = useState([])
    const [courses, setCourses] = useState([])
    const [selectedCourse, setSelectedCourse] = useState('')
    const [marks, setMarks] = useState({})
    const [loading, setLoading] = useState(false)
    const [showAddMarkModal, setShowAddMarkModal] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [studentMark, setStudentMark] = useState('')
    const [selectedAssessmentType, setSelectedAssessmentType] = useState('assignment')

    // Redirect if not logged in
    React.useEffect(() => {
        if (!localStorage.getItem('user_id') || localStorage.getItem('user_type') !== 'teacher') {
            navigate('/')
            return
        }
    }, [navigate])

    // Fetch students and courses when insert form is shown
    useEffect(() => {
        if (showInsertForm) {
            fetchStudentsAndCourses()
        }
    }, [showInsertForm])

    const fetchStudentsAndCourses = async () => {
        setLoading(true)
        try {
            // Fetch real students from database
            const studentsResponse = await fetch(`http://localhost/student_portal/get_all_students.php`)
            const studentsData = await studentsResponse.json()
            
            if (studentsData.success) {
                setStudents(studentsData.data || [])
            } else {
                setStudents(getMockStudents())
            }

            // Fetch courses for teacher's subject
            const coursesResponse = await fetch(`http://localhost/student_portal/get_teacher_courses.php?teacher_id=${teacherId}&subject=${teacherSubject}`)
            const coursesData = await coursesResponse.json()
            
            if (coursesData.success) {
                setCourses(coursesData.data || [])
                if (coursesData.data && coursesData.data.length > 0) {
                    setSelectedCourse(coursesData.data[0].course_id)
                }
            } else {
                // Fallback to mock courses
                setCourses(getMockCourses())
                if (getMockCourses().length > 0) {
                    setSelectedCourse(getMockCourses()[0].course_id)
                }
            }
            
        } catch (error) {
            console.error('Error fetching data:', error)
            setStudents(getMockStudents())
            setCourses(getMockCourses())
            if (getMockCourses().length > 0) {
                setSelectedCourse(getMockCourses()[0].course_id)
            }
        } finally {
            setLoading(false)
        }
    }

    // Mock data as fallback
    const getMockStudents = () => {
        return [
            { student_id: 1, first_name: 'John', last_name: 'Doe', grade: '10th Grade', user_number: 'STU001' },
            { student_id: 2, first_name: 'Jane', last_name: 'Smith', grade: '10th Grade', user_number: 'STU002' },
            { student_id: 3, first_name: 'Mike', last_name: 'Johnson', grade: '10th Grade', user_number: 'STU003' }
        ]
    }

    const getMockCourses = () => {
        return [
            { course_id: 1, course_name: 'Mathematics', course_code: 'MATH101', grade_level: '10th Grade' },
            { course_id: 2, course_name: 'Advanced Mathematics', course_code: 'MATH201', grade_level: '11th Grade' }
        ]
    }

    const handleLogout = () => {
        localStorage.clear()
        navigate('/')
    }

    const handleInsertAssessmentClick = () => {
        setShowInsertForm(true)
        setSelectedAssessmentType('assignment')
        fetchStudentsAndCourses()
    }

    const handleAssessmentTypeChange = (type) => {
        setSelectedAssessmentType(type)
    }

    const handleAddMarkClick = (student) => {
        setSelectedStudent(student)
        setStudentMark(marks[student.student_id] || '')
        setShowAddMarkModal(true)
    }

    // REAL MARK SUBMISSION TO DATABASE
    const handleSaveMark = async () => {
        if (!selectedStudent || !selectedCourse) return

        const markValue = parseFloat(studentMark)
        if (isNaN(markValue) || markValue < 0 || markValue > 100) {
            alert('Please enter a valid mark between 0 and 100')
            return
        }

        try {
            // Submit mark to database
            const response = await fetch('http://localhost/student_portal/insert_assessment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teacher_id: teacherId,
                    subject_type: teacherSubject,
                    student_id: selectedStudent.student_id,
                    course_id: selectedCourse,
                    assessment_type: selectedAssessmentType,
                    marks: markValue,
                    assessment_date: new Date().toISOString().split('T')[0]
                })
            })

            const result = await response.json()

            if (result.success) {
                // Update local state
                setMarks(prev => ({
                    ...prev,
                    [selectedStudent.student_id]: studentMark
                }))

                setShowAddMarkModal(false)
                setSelectedStudent(null)
                setStudentMark('')
                alert(`✅ Mark ${studentMark} saved for ${selectedStudent.first_name} ${selectedStudent.last_name}`)
            } else {
                alert(`❌ Error saving mark: ${result.message}`)
            }
        } catch (error) {
            console.error('Error saving mark:', error)
            alert('❌ Network error saving mark')
        }
    }

    // BULK SUBMIT ALL MARKS
    const handleSubmitAssessment = async () => {
        if (!selectedCourse) {
            alert('Please select a course')
            return
        }

        // Check if any marks have been entered
        const enteredMarks = Object.values(marks).filter(mark => mark && mark > 0)
        if (enteredMarks.length === 0) {
            alert('Please enter marks for at least one student')
            return
        }

        setLoading(true)
        try {
            // Prepare all marks for submission
            const assessments = Object.entries(marks)
                .filter(([studentId, mark]) => mark && mark > 0)
                .map(([studentId, mark]) => ({
                    teacher_id: teacherId,
                    subject_type: teacherSubject,
                    student_id: parseInt(studentId),
                    course_id: parseInt(selectedCourse),
                    assessment_type: selectedAssessmentType,
                    marks: parseFloat(mark),
                    assessment_date: new Date().toISOString().split('T')[0]
                }))

            // Submit all marks to database
            const response = await fetch('http://localhost/student_portal/insert_bulk_assessments.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ assessments })
            })

            const result = await response.json()

            if (result.success) {
                const submittedCount = Object.values(marks).filter(mark => mark && mark > 0).length
                alert(`✅ Successfully submitted ${selectedAssessmentType} marks for ${submittedCount} students!`)
                setShowInsertForm(false)
                setMarks({})
                setSelectedAssessmentType('')
            } else {
                alert(`❌ Error submitting assessments: ${result.message}`)
            }
            
        } catch (error) {
            console.error('Error submitting assessments:', error)
            alert('❌ Network error submitting assessments')
        } finally {
            setLoading(false)
        }
    }

    const closeInsertForm = () => {
        setShowInsertForm(false)
        setSelectedAssessmentType('')
        setMarks({})
    }

    const closeAddMarkModal = () => {
        setShowAddMarkModal(false)
        setSelectedStudent(null)
        setStudentMark('')
    }

    return (
        <div className="teacher-dashboard">
            <header className="dashboard-header">
                <h1>Teacher Dashboard</h1>
                <div className="user-info">
                    <span>Welcome, {teacherName} ({teacherSubject})</span>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>
            
            <div className="dashboard-content">
                <div className="welcome-card">
                    <h2>👋 Welcome back, {teacherName}!</h2>
                    <p>You are teaching: <strong>{teacherSubject}</strong></p>
                    
                    <div className="quick-stats">
                        <div className="stat-card">
                            <h3>Students</h3>
                            <p>{students.length}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Courses</h3>
                            <p>{courses.length}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Subject</h3>
                            <p>{teacherSubject}</p>
                        </div>
                    </div>
                </div>

                <div className="action-grid">
                    <div className="action-card" onClick={handleInsertAssessmentClick}>
                        <h3>📝 Insert Assessments</h3>
                        <p>Add grades for assignments, quizzes, and exams</p>
                    </div>
                    
                    <div className="action-card" onClick={() => alert('View Assessments feature coming soon!')}>
                        <h3>📊 View Assessments</h3>
                        <p>View and manage student assessments</p>
                    </div>
                    
                    <div className="action-card" onClick={() => alert('Attendance feature coming soon!')}>
                        <h3>📅 Manage Attendance</h3>
                        <p>Record and view student attendance</p>
                    </div>
                    
                    <div className="action-card" onClick={() => alert('Reports feature coming soon!')}>
                        <h3>📈 Generate Reports</h3>
                        <p>Create performance reports</p>
                    </div>
                </div>

                {/* Insert Assessment Form */}
                {showInsertForm && (
                    <div className="insert-assessment-modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Insert Assessment Marks</h2>
                                <button onClick={closeInsertForm} className="close-btn">×</button>
                            </div>
                            
                            <div className="form-section">
                                <div className="form-group">
                                    <label>Assessment Type:</label>
                                    <select 
                                        value={selectedAssessmentType} 
                                        onChange={(e) => handleAssessmentTypeChange(e.target.value)}
                                        className="course-select"
                                    >
                                        <option value="assignment">Assignment</option>
                                        <option value="quiz">Quiz</option>
                                        <option value="mid_exam">Mid Exam</option>
                                        <option value="final_exam">Final Exam</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Course:</label>
                                    <select 
                                        value={selectedCourse} 
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        className="course-select"
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map(course => (
                                            <option key={course.course_id} value={course.course_id}>
                                                {course.course_name} ({course.grade_level})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Subject:</label>
                                    <input 
                                        type="text" 
                                        value={teacherSubject} 
                                        readOnly 
                                        className="readonly-input"
                                    />
                                </div>
                            </div>

                            {loading ? (
                                <div className="loading">Loading students...</div>
                            ) : (
                                <div className="students-marks-table">
                                    <h3>Student List - Click "Add Mark" to enter marks for each student</h3>
                                    <div className="table-container">
                                        <table className="students-table">
                                            <thead>
                                                <tr>
                                                    <th>Student ID</th>
                                                    <th>Student Name</th>
                                                    <th>Grade</th>
                                                    <th>Current Mark</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {students.length > 0 ? (
                                                    students.map(student => (
                                                        <tr key={student.student_id}>
                                                            <td>{student.user_number || student.student_id}</td>
                                                            <td>{student.first_name} {student.last_name}</td>
                                                            <td>{student.grade}</td>
                                                            <td className="marks-cell">
                                                                {marks[student.student_id] ? `${marks[student.student_id]}/100` : 'Not entered'}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    onClick={() => handleAddMarkClick(student)}
                                                                    className="add-mark-btn"
                                                                >
                                                                    📝 Add Mark
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="5" className="no-data">No students found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="marks-summary">
                                        <p>
                                            <strong>Marks Entered:</strong> {Object.values(marks).filter(mark => mark && mark > 0).length} of {students.length} students
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button onClick={closeInsertForm} className="cancel-btn">
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSubmitAssessment} 
                                    disabled={loading || !selectedCourse || Object.values(marks).filter(mark => mark && mark > 0).length === 0}
                                    className="submit-btn"
                                >
                                    {loading ? 'Submitting...' : `Submit ${selectedAssessmentType.replace('_', ' ')} Marks`}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Mark Modal */}
                {showAddMarkModal && selectedStudent && (
                    <div className="add-mark-modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Add Mark for {selectedStudent.first_name} {selectedStudent.last_name}</h2>
                                <button onClick={closeAddMarkModal} className="close-btn">×</button>
                            </div>
                            
                            <div className="form-section">
                                <div className="form-group">
                                    <label>Student:</label>
                                    <input 
                                        type="text" 
                                        value={`${selectedStudent.first_name} ${selectedStudent.last_name} (${selectedStudent.user_number})`}
                                        readOnly 
                                        className="readonly-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Assessment Type:</label>
                                    <input 
                                        type="text" 
                                        value={selectedAssessmentType.replace('_', ' ').toUpperCase()} 
                                        readOnly 
                                        className="readonly-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Course:</label>
                                    <input 
                                        type="text" 
                                        value={courses.find(c => c.course_id === selectedCourse)?.course_name || ''} 
                                        readOnly 
                                        className="readonly-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Enter Mark (0-100):</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={studentMark}
                                        onChange={(e) => setStudentMark(e.target.value)}
                                        placeholder="Enter mark out of 100"
                                        className="marks-input"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button onClick={closeAddMarkModal} className="cancel-btn">
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveMark}
                                    className="submit-btn"
                                >
                                    Save Mark to Database
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TeacherDashboard