import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { adminAPI, authAPI } from "../api/api";

function AdminDashboard({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [activeUser, setActiveUser] = useState(location.state?.user || null);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const initDashboard = async () => {
      const user = activeUser || (await authAPI.getCurrentUser());

      if (!user || user.role !== "admin") {
        navigate("/");
        return;
      }

      setActiveUser(user);
      loadStudents();
    };

    initDashboard();
  }, [activeUser, navigate]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getStudents();
      setStudents(data);
    } catch (err) {
      setError("Failed to load students");
      console.error("Load students error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!query.trim()) {
      return students;
    }

    // For now, filter locally. In a real app, you might want to search server-side
    return students.filter((student) =>
      student.id.toLowerCase().includes(query.toLowerCase()) ||
      student.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, students]);

  const saveFeedback = async (studentId) => {
    const value = feedbackMap[studentId];
    if (!value?.trim()) {
      return;
    }

    try {
      // For demo purposes, we'll add feedback to the first unreviewed project
      // In a real app, you'd have a modal to select which project
      const studentProjects = await adminAPI.getStudentProjects(studentId);
      const unreviewedProject = studentProjects.find(p => !p.reviewed);

      if (unreviewedProject) {
        await adminAPI.addFeedback(unreviewedProject._id, value);
        alert(`Feedback saved for ${studentId}: ${value}`);
        setFeedbackMap((prev) => ({ ...prev, [studentId]: "" }));
        // Reload students to update stats
        loadStudents();
      } else {
        alert("No unreviewed projects found for this student");
      }
    } catch (err) {
      alert("Failed to save feedback");
      console.error("Save feedback error:", err);
    }
  };

  const logout = () => {
    authAPI.logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="dashboard-page">
      <header className="top-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>
            Welcome {activeUser?.name || "Faculty"}. Review student portfolios
            and provide feedback.
          </p>
        </div>
        <div className="header-actions">
          <button className="outline-btn theme-toggle" onClick={onToggleTheme}>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <button className="outline-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <section className="section-block">
        <h2 className="section-title">Students</h2>
        <div className="search-card">
          <label htmlFor="studentSearch">Search by Student ID</label>
          <input
            id="studentSearch"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Example: 240003001"
          />
        </div>

        <div className="student-grid">
          {loading ? (
            <p>Loading students...</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : filteredStudents.length === 0 ? (
            <p className="empty-text">No students found for this ID.</p>
          ) : (
            filteredStudents.map((student) => {
              const progress = student.projects === 0 ? 0 : Math.round((student.reviewed / student.projects) * 100);
              return (
                <article key={student.id} className="student-card">
                  <div className="row-between">
                    <h3>{student.name}</h3>
                    <span className="id-pill">{student.id}</span>
                  </div>

                  <p>{student.email}</p>

                  <div className="metric-row">
                    <span>Projects</span>
                    <strong>{student.projects}</strong>
                  </div>
                  <div className="metric-row">
                    <span>Reviewed</span>
                    <strong className="text-success">{student.reviewed}</strong>
                  </div>
                  <div className="metric-row">
                    <span>Pending</span>
                    <strong className="text-warning">{student.pending}</strong>
                  </div>
                  <div className="metric-row">
                    <span>Progress</span>
                    <strong>{progress}%</strong>
                  </div>

                  <div className="progress-wrap">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>

                  <textarea
                    rows="2"
                    placeholder="Add feedback"
                    value={feedbackMap[student.id] || ""}
                    onChange={(event) =>
                      setFeedbackMap((prev) => ({
                        ...prev,
                        [student.id]: event.target.value,
                      }))
                    }
                  />
                  <button onClick={() => saveFeedback(student.id)}>Save Feedback</button>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
