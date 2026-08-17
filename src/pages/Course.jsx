import { useState, useEffect } from "react";
const API_BASE = "https://adminbackend-production-f7a6.up.railway.app/api/courses";

function CourseManager() {
  // 1. Core Data States
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);

  // 2. Interactive Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "add", "edit", or "delete"
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseName, setCourseName] = useState("");
  const [courseStatus, setCourseStatus] = useState("active");

  // Fetch courses from backend when component mounts
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
  try {
    const response = await fetch(API_BASE);
    const data = await response.json();
    if (response.ok) {
      setCourses(data.courses);
      setStats(data.stats);
    }
  } catch (error) {
    console.error("Error loading courses:", error);
  } finally {
    setLoading(false);
  }
};

  // 3. Handle CRUD Submissions
 const handleActionSubmit = async (e) => {
  e.preventDefault();
  let url = API_BASE;
  let method = "POST";
  let body = JSON.stringify({ name: courseName, status: courseStatus });

  if (modalType === "edit") {
    url = `${API_BASE}/${selectedCourse.id}`;
    method = "PUT";
  } else if (modalType === "delete") {
    url = `${API_BASE}/${selectedCourse.id}`;
    method = "DELETE";
    body = null;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (response.ok) {
      closeModal();
      fetchCourses();
    } else {
      const data = await response.json();
      alert(data.message || "Action failed");
    }
  } catch (error) {
    console.error("Action handler crash:", error);
  }
};

  const openModal = (type, course = null) => {
    setModalType(type);
    setSelectedCourse(course);
    setCourseName(course ? course.name : "");
    setCourseStatus(course ? course.status : "active");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
    setCourseName("");
    setCourseStatus("active");
  };

  if (loading) return <div className="course-page"><p>Loading system records...</p></div>;

  return (
    <div className="course-page">
      <h1>Course Manager</h1>
      <p>Manage and organize all your courses here.</p>

      {/* Live Database Statistics Aggregates */}
      <div className="course-stats">
        <h3>Total Courses: {stats.total}</h3>
        <h3>Active: {stats.active}</h3>
        <h3>Inactive: {stats.inactive}</h3>
      </div>

      {/* Dynamic Data Array Mapping Loop */}
      <div className="course-list">
        <h2>Available Courses</h2>
        <ul>
          {courses.map((course) => (
            <li 
              key={course.id} 
              onClick={() => setSelectedCourse(course)}
              className={selectedCourse?.id === course.id ? "selected-item" : ""}
              style={{ cursor: "pointer", padding: "8px", margin: "4px 0", borderRadius: "4px", backgroundColor: selectedCourse?.id === course.id ? "#e0e0e0" : "transparent" }}
            >
              <strong>{course.name}</strong> - <span className={`status-${course.status}`}>{course.status}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Trigger Interface Layout */}
      <div className="course-actions">
        <button onClick={() => openModal("add")}>Add Course</button>
        <button disabled={!selectedCourse} onClick={() => openModal("edit", selectedCourse)}>Edit Selected</button>
        <button disabled={!selectedCourse} onClick={() => openModal("delete", selectedCourse)}>Delete Selected</button>
      </div>

      {/* Interactive Action Window Overlay Modal */}
      {showModal && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className="modal-content" style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", width: "400px" }}>
            <h2>{modalType.toUpperCase()} COURSE</h2>
            
            <form onSubmit={handleActionSubmit}>
              {modalType !== "delete" ? (
                <>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "4px" }}>Course Name:</label>
                    <input 
                      type="text" 
                      value={courseName} 
                      onChange={(e) => setCourseName(e.target.value)} 
                      required 
                      style={{ width: "100%", padding: "8px" }}
                    />
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "4px" }}>Status:</label>
                    <select value={courseStatus} onChange={(e) => setCourseStatus(e.target.value)} style={{ width: "100%", padding: "8px" }}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </>
              ) : (
                <p>Are you sure you want to delete <strong>{selectedCourse?.name}</strong>?</p>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button type="button" onClick={closeModal}>Cancel</button>
                <button type="submit" style={{ backgroundColor: modalType === "delete" ? "red" : "green", color: "white" }}>
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseManager;
