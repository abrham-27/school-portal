import React, { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "./StudentDashboard.css"

export default function StudentDashboard() {
    const [activeLink, setActiveLink] = useState("profile")
    const [profile, setProfile] = useState(null)
    const [courses, setCourses] = useState([])
    const [classSchedule, setClassSchedule] = useState([])
    const [assessments, setAssessments] = useState([])
    const [courseMarks, setCourseMarks] = useState({})
    const [selectedCourseForMarks, setSelectedCourseForMarks] = useState(null)
    const [editingProfile, setEditingProfile] = useState(false)
    const [profileForm, setProfileForm] = useState({
        first_name: '',
        father_name: '',
        grandfather_name: '',
        email: '',
        grade: '',
        user_number: ''
    })
    const navigate = useNavigate()
    
    const studentId = localStorage.getItem('user_id')
    const userType = localStorage.getItem('user_type')

    const [loading, setLoading] = useState({
        profile: false,
        profileUpdate: false,
        courses: false,
        class: false,
        marks: false,
        assessments: false
    })

    // Redirect if not logged in
    useEffect(() => {
        console.log("Checking authentication:", { studentId, userType })
        if (!studentId || userType !== 'student') {
            navigate('/')
            return
        }
    }, [studentId, userType, navigate])

    // Fetch student profile
    const fetchProfile = () => {
        if (!studentId) {
            console.error("No student ID found")
            return
        }
        
        console.log("Fetching profile for student ID:", studentId)
        setLoading(prev => ({ ...prev, profile: true }))
        
        axios
            .get(`http://localhost/student_portal/get_profile.php?student_id=${studentId}`)
            .then((response) => {
                console.log("Profile API Response:", response.data)
                
                if (response.data && response.data.success === true) {
                    // Handle both direct profile data and nested data structure
                    const profileData = response.data.data || response.data.profile || response.data;
                    setProfile(profileData);
                    setProfileForm({
                        first_name: profileData.first_name || '',
                        father_name: profileData.father_name || '',
                        grandfather_name: profileData.grandfather_name || '',
                        email: profileData.email || '',
                        grade: profileData.grade || '',
                        user_number: profileData.user_number || ''
                    })
                    console.log("Profile data set successfully:", profileData)
                } else {
                    console.error("Profile API returned error:", response.data)
                    // Set demo data only if API fails
                    setProfile({
                        first_name: 'Demo',
                        last_name: 'Student',
                        father_name: 'Demo Father',
                        grandfather_name: 'Demo Grandfather',
                        grade: '10th Grade',
                        user_number: 'STU' + studentId,
                        email: 'demo@student.com'
                    })
                }
            })
            .catch((error) => {
                console.error("Error fetching profile:", error)
                // Only set demo data on network errors, not for invalid student IDs
                setProfile({
                    first_name: 'Demo',
                    last_name: 'Student',
                    father_name: 'Demo Father',
                    grandfather_name: 'Demo Grandfather',
                    grade: '10th Grade',
                    user_number: 'STU' + studentId,
                    email: 'demo@student.com'
                })
            })
            .finally(() => {
                setLoading(prev => ({ ...prev, profile: false }))
            })
    }

    // Fetch profile when component mounts or when profile tab is active
    useEffect(() => {
        if (activeLink === "profile") {
            fetchProfile()
        }
    }, [activeLink, studentId])

    // Fetch data when tabs change
    useEffect(() => {
        if (activeLink === "results" && studentId) {
            fetchAssessments()
        }
        if (activeLink === "courses" && studentId) {
            fetchCourses()
        }
        if (activeLink === "class" && studentId) {
            fetchClassSchedule()
        }
    }, [activeLink, studentId, profile?.grade])

    // Fetch courses by student's grade via backend
    const fetchCourses = async () => {
        setLoading(prev => ({ ...prev, courses: true }))
        try {
            const response = await axios.get(`http://localhost/student_portal/get_courses.php?student_id=${profile?.user_number || studentId}`)
            if (response.data?.success) {
                setCourses(response.data.data || [])
            } else {
                setCourses([])
            }
        } catch (error) {
            console.error("Error fetching courses:", error)
            setCourses([])
        } finally {
            setLoading(prev => ({ ...prev, courses: false }))
        }
    }

    // Final fallback: Demo courses
    const setDemoCourses = () => {
        console.log("Setting demo courses")
        const demoCourses = [
            {
                course_id: 1,
                course_name: "Mathematics",
                course_code: "MATH101",
                grade_level: profile?.grade || "10th Grade",
                description: "Advanced mathematics course covering algebra, geometry, and calculus"
            },
            {
                course_id: 2,
                course_name: "Science",
                course_code: "SCI101",
                grade_level: profile?.grade || "10th Grade",
                description: "General science course covering physics, chemistry, and biology"
            },
            {
                course_id: 3,
                course_name: "English",
                course_code: "ENG101",
                grade_level: profile?.grade || "10th Grade",
                description: "English language and literature course"
            }
        ]
        setCourses(demoCourses)
    }

    // Fetch assessments (all types) for results table
    const fetchAssessments = async () => {
        setLoading(prev => ({ ...prev, assessments: true }))
        try {
            const response = await axios.get(`http://localhost/student_portal/get_assessments.php?student_id=${studentId}`)
            if (response.data?.success) {
                setAssessments(response.data.data || [])
            } else {
                setAssessments([])
            }
        } catch (error) {
            console.error("Error fetching assessments:", error)
            setAssessments([])
        } finally {
            setLoading(prev => ({ ...prev, assessments: false }))
        }
    }

    const fetchCourseMarks = (courseId, courseName) => {
        setSelectedCourseForMarks({ courseId, courseName })
        const filtered = assessments.filter(a => a.course_id === courseId || a.subject === courseName)
        if (filtered.length) {
            setCourseMarks(prev => ({ ...prev, [courseId]: filtered }))
        } else {
            setCourseMarks(prev => ({
                ...prev,
                [courseId]: [{
                    assessment_type: 'No marks available',
                    marks: 'N/A',
                    total_marks: 'N/A',
                    date: 'N/A',
                    teacher_name: 'N/A'
                }]
            }))
        }
    }

    const fetchClassSchedule = async () => {
        const grade = profile?.grade
        if (!grade) return
        setLoading(prev => ({ ...prev, class: true }))
        try {
            const response = await axios.get(`http://localhost/student_portal/get_class_schedule.php?grade=${encodeURIComponent(grade)}`)
            if (response.data?.success) {
                setClassSchedule(response.data.data || [])
            } else {
                setClassSchedule([])
            }
        } catch (error) {
            console.error("Error fetching class schedule:", error)
            setClassSchedule([])
        } finally {
            setLoading(prev => ({ ...prev, class: false }))
        }
    }

    const handleLogout = () => {
        localStorage.clear()
        navigate('/')
    }

    const handleProfileChange = (e) => {
        const { name, value } = e.target
        setProfileForm(prev => ({ ...prev, [name]: value }))
    }

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        setLoading(prev => ({ ...prev, profileUpdate: true }))
        try {
            const response = await axios.post('http://localhost/student_portal/update_profile.php', {
                student_id: studentId,
                ...profileForm
            })
            if (response.data?.success) {
                setProfile(prev => ({ ...prev, ...profileForm }))
                setEditingProfile(false)
            } else {
                alert(response.data?.message || 'Unable to update profile')
            }
        } catch (error) {
            console.error("Error updating profile:", error)
            alert('Update failed. Please try again.')
        } finally {
            setLoading(prev => ({ ...prev, profileUpdate: false }))
        }
    }

    const handleViewMarks = (course) => {
        fetchCourseMarks(course.course_id, course.course_name)
    }

    const closeMarksModal = () => {
        setSelectedCourseForMarks(null)
    }

    const retryCourseFetch = () => {
        console.log("Retrying course fetch...")
        fetchCourses()
    }

    const renderProfile = () => (
        <div className="card">
            <div className="card-header">
                <h2>👤 Profile Information</h2>
                <div className="card-actions">
                    <button 
                        onClick={fetchProfile} 
                        className="refresh-btn"
                        disabled={loading.profile}
                    >
                        {loading.profile ? 'Refreshing...' : '🔄 Refresh'}
                    </button>
                    <button 
                        onClick={() => setEditingProfile(prev => !prev)} 
                        className="refresh-btn"
                    >
                        {editingProfile ? 'Cancel' : '✏️ Edit'}
                    </button>
                </div>
            </div>
            
            {loading.profile ? (
                <div className="loading-section">Loading profile information...</div>
            ) : profile ? (
                <div className="profile-info">
                    {editingProfile && (
                        <form className="profile-form" onSubmit={handleProfileUpdate}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input name="first_name" value={profileForm.first_name} onChange={handleProfileChange} />
                                </div>
                                <div className="form-group">
                                    <label>Father Name</label>
                                    <input name="father_name" value={profileForm.father_name} onChange={handleProfileChange} />
                                </div>
                                <div className="form-group">
                                    <label>Grandfather Name</label>
                                    <input name="grandfather_name" value={profileForm.grandfather_name} onChange={handleProfileChange} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input name="email" value={profileForm.email} onChange={handleProfileChange} />
                                </div>
                                <div className="form-group">
                                    <label>Grade</label>
                                    <input name="grade" value={profileForm.grade} onChange={handleProfileChange} />
                                </div>
                                <div className="form-group">
                                    <label>Student ID</label>
                                    <input name="user_number" value={profileForm.user_number} onChange={handleProfileChange} disabled />
                                </div>
                            </div>
                            <button type="submit" className="save-btn" disabled={loading.profileUpdate}>
                                {loading.profileUpdate ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    )}
                    <div className="profile-section">
                        <h3>Personal Information</h3>
                        <div className="profile-grid">
                            <div className="profile-item">
                                <strong>First Name:</strong>
                                <span>{profile.first_name || profile.firstName || 'N/A'}</span>
                            </div>
                            <div className="profile-item">
                                <strong>Last Name:</strong>
                                <span>{profile.last_name || profile.lastName || 'N/A'}</span>
                            </div>
                            <div className="profile-item">
                                <strong>Father Name:</strong>
                                <span>{profile.father_name || profile.fatherName || 'N/A'}</span>
                            </div>
                            <div className="profile-item">
                                <strong>Grandfather Name:</strong>
                                <span>{profile.grandfather_name || profile.grandfatherName || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="profile-section">
                        <h3>Academic Information</h3>
                        <div className="profile-grid">
                            <div className="profile-item">
                                <strong>Grade/Class:</strong>
                                <span>{profile.grade || profile.grade_level || profile.class || 'N/A'}</span>
                            </div>
                            <div className="profile-item">
                                <strong>Student ID:</strong>
                                <span>{profile.user_number || profile.student_id || profile.id || studentId || 'N/A'}</span>
                            </div>
                            <div className="profile-item">
                                <strong>Email:</strong>
                                <span>{profile.email || profile.user_email || 'N/A'}</span>
                            </div>
                            <div className="profile-item">
                                <strong>Phone Number:</strong>
                                <span>{profile.phone || profile.phone_number || profile.mobile || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="profile-section">
                        <h3>Additional Information</h3>
                        <div className="profile-grid">
                            <div className="profile-item">
                                <strong>Date of Birth:</strong>
                                <span>{profile.dob || profile.date_of_birth || profile.birth_date || 'N/A'}</span>
                            </div>
                            <div className="profile-item">
                                <strong>Gender:</strong>
                                <span>{profile.gender || profile.sex || 'N/A'}</span>
                            </div>
                            <div className="profile-item">
                                <strong>Address:</strong>
                                <span>{profile.address || profile.home_address || profile.location || 'N/A'}</span>
                            </div>
                            <div className="profile-item">
                                <strong>Registration Date:</strong>
                                <span>{profile.registration_date || profile.created_at || profile.date_joined || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="error-section">
                    <p className="no-data">❌ No profile data available.</p>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                        Student ID: {studentId}
                    </p>
                    <button onClick={fetchProfile} className="retry-btn">
                        🔄 Try Again
                    </button>
                </div>
            )}
        </div>
    )

    const renderResults = () => {
        const rows = assessments.reduce((acc, a) => {
            const subject = a.subject || a.course || 'Unknown Course'
            if (!acc[subject]) {
                acc[subject] = {
                    subject,
                    assignment: '-',
                    quiz: '-',
                    mid_exam: '-',
                    final_exam: '-',
                    other: '-'
                }
            }
            const type = (a.type || '').toLowerCase()
            const value = `${a.score ?? a.marks ?? '-'} / ${a.total ?? a.total_marks ?? ''}`.trim()
            if (type.includes('assign')) acc[subject].assignment = value
            else if (type.includes('quiz')) acc[subject].quiz = value
            else if (type.includes('mid')) acc[subject].mid_exam = value
            else if (type.includes('final')) acc[subject].final_exam = value
            else acc[subject].other = value
            return acc
        }, {})

        const rowsArr = Object.values(rows)

        return (
            <div className="card">
                <h2>📊 Results</h2>
                {loading.assessments ? (
                    <div className="loading-section">Loading assessments...</div>
                ) : rowsArr.length ? (
                    <div className="table-responsive">
                        <table className="marks-table">
                            <thead>
                                <tr>
                                    <th>Course / Subject</th>
                                    <th>Assignment</th>
                                    <th>Quiz</th>
                                    <th>Mid Exam</th>
                                    <th>Final Exam</th>
                                    <th>Other</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rowsArr.map((row, idx) => (
                                    <tr key={idx}>
                                        <td>{row.subject}</td>
                                        <td>{row.assignment}</td>
                                        <td>{row.quiz}</td>
                                        <td>{row.mid_exam}</td>
                                        <td>{row.final_exam}</td>
                                        <td>{row.other}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="no-data-message">
                        <p>No assessments found yet.</p>
                    </div>
                )}
            </div>
        )
    }

    const renderCourses = () => (
        <div className="card">
            <div className="card-header">
                <h2>📚 Courses</h2>
                <button onClick={retryCourseFetch} className="refresh-btn" disabled={loading.courses}>
                    {loading.courses ? 'Refreshing...' : '🔄 Refresh'}
                </button>
            </div>
            {loading.courses ? (
                <div className="loading-section">Loading courses...</div>
            ) : courses.length ? (
                <div className="courses-grid">
                    {courses.map((course, idx) => (
                        <div key={idx} className="course-card">
                            <div className="course-header">
                                <h4>{course.name || course.course_name}</h4>
                                <span className="course-code">{course.code || course.course_code}</span>
                            </div>
                            <p className="course-description">
                                {course.description || 'No description provided'}
                            </p>
                            <div className="course-meta">
                                <span><strong>Instructor:</strong> {course.instructor || 'TBD'}</span>
                                <span><strong>Schedule:</strong> {course.schedule || 'TBD'}</span>
                                <span><strong>Credits:</strong> {course.credits || '—'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-data-message">
                    <p>No courses available for grade {profile?.grade || 'N/A'}.</p>
                </div>
            )}
        </div>
    )

    const renderClassArrangement = () => (
        <div className="card">
            <h2>🏫 Class Arrangement</h2>
            {loading.class ? (
                <div className="loading-section">Loading class arrangement...</div>
            ) : classSchedule.length > 0 ? (
                <div className="class-arrangement">
                    <table className="arrangement-table">
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Time</th>
                                <th>Subject</th>
                                <th>Room</th>
                                <th>Teacher</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classSchedule.map((slot, index) => (
                                <tr key={index}>
                                    <td>{slot.day}</td>
                                    <td>{slot.time}</td>
                                    <td>{slot.subject}</td>
                                    <td>{slot.room}</td>
                                    <td>{slot.teacher}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="no-data-message">
                    No class arrangement data available for grade {profile?.grade || 'N/A'}.
                </div>
            )}
        </div>
    )

    return (
        <div className="student-dashboard">
            <header className="dashboard-header">
                <h1>Student Dashboard</h1>
                <div className="user-info">
                    <span>Welcome, {profile?.first_name || 'Student'} (ID: {studentId})</span>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            <div className="dashboard-content-wrapper">
                <aside className="sidebar">
                    <h2 className="sidebar-title">Menu</h2>
                    <ul>
                        <li 
                            className={activeLink === "profile" ? "active" : ""} 
                            onClick={() => setActiveLink("profile")}
                        >
                            👤 Profile
                        </li>
                        <li 
                            className={activeLink === "results" ? "active" : ""} 
                            onClick={() => setActiveLink("results")}
                        >
                            📊 View Results
                        </li>
                        <li 
                            className={activeLink === "courses" ? "active" : ""} 
                            onClick={() => setActiveLink("courses")}
                        >
                            📚 Courses
                        </li>
                        <li 
                            className={activeLink === "class" ? "active" : ""} 
                            onClick={() => setActiveLink("class")}
                        >
                            🏫 Class Arrangement
                        </li>
                    </ul>
                </aside>

                <main className="content">
                    {activeLink === "profile" && renderProfile()}
                    {activeLink === "results" && renderResults()}
                    {activeLink === "courses" && renderCourses()}
                    {activeLink === "class" && renderClassArrangement()}
                </main>
            </div>
        </div>
    )
}