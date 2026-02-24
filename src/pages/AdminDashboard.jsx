import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const INITIAL_STUDENTS = [
  {
    id: "240003001",
    name: "Arjun Kumar",
    email: "arjun.kumar@university.edu",
    projects: 2,
    reviewed: 1,
    pending: 1,
  },
  {
    id: "240003002",
    name: "Priya Sharma",
    email: "priya.sharma@university.edu",
    projects: 3,
    reviewed: 2,
    pending: 1,
  },
  {
    id: "240003003",
    name: "Rahul Patel",
    email: "rahul.patel@university.edu",
    projects: 4,
    reviewed: 3,
    pending: 1,
  },
  {
    id: "240003004",
    name: "Ananya Singh",
    email: "ananya.singh@university.edu",
    projects: 2,
    reviewed: 1,
    pending: 1,
  },
];

function AdminDashboard({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [feedbackMap, setFeedbackMap] = useState({});
  const activeUser = location.state?.user;

  const filteredStudents = useMemo(() => {
    if (!query.trim()) {
      return INITIAL_STUDENTS;
    }

    return INITIAL_STUDENTS.filter((student) => student.id.includes(query.trim()));
  }, [query]);

  const saveFeedback = (studentId) => {
    const value = feedbackMap[studentId];
    if (!value?.trim()) {
      return;
    }
    alert(`Feedback saved for ${studentId}: ${value}`);
  };

  const logout = () => {
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
          {filteredStudents.length === 0 && (
            <p className="empty-text">No students found for this ID.</p>
          )}

          {filteredStudents.map((student) => {
            const progress = Math.round((student.reviewed / student.projects) * 100);
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
          })}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
