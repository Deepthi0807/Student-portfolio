import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authAPI, studentAPI } from "../api/api";

function StudentDashboard({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [activeUser, setActiveUser] = useState(location.state?.user || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const initDashboard = async () => {
      const user = activeUser || (await authAPI.getCurrentUser());

      if (!user || user.role !== "student") {
        navigate("/");
        return;
      }

      setActiveUser(user);
      loadProjects();
    };

    initDashboard();
  }, [activeUser, navigate]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await studentAPI.getProjects();
      setProjects(data);
    } catch (err) {
      setError("Failed to load projects");
      console.error("Load projects error:", err);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = useMemo(() => {
    const total = projects.length;
    const reviewed = projects.filter((project) => project.reviewed).length;
    const pending = total - reviewed;
    const completion = total === 0 ? 0 : Math.round((reviewed / total) * 100);

    return { total, reviewed, pending, completion };
  }, [projects]);

  const createProject = async () => {
    try {
      const newProject = {
        title: `New Project ${projects.length + 1}`,
        description: "Add your project summary, milestone, and media uploads.",
        milestone: "Planning",
        progress: 0,
        media: "No media uploaded"
      };

      const createdProject = await studentAPI.createProject(newProject);
      setProjects((prev) => [createdProject, ...prev]);
    } catch (err) {
      setError("Failed to create project");
      console.error("Create project error:", err);
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
          <h1>{activeUser.name}</h1>
          <p>Student ID: {activeUser.studentId}</p>
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
        <h2 className="section-title">Dashboard</h2>
        <div className="summary-grid">
          <article className="summary-card">
            <h3>Total Projects</h3>
            <p>{dashboardStats.total}</p>
            <small>All projects</small>
          </article>
          <article className="summary-card">
            <h3>Reviewed</h3>
            <p className="text-success">{dashboardStats.reviewed}</p>
            <small>Completed reviews</small>
          </article>
          <article className="summary-card">
            <h3>Pending Review</h3>
            <p className="text-warning">{dashboardStats.pending}</p>
            <small>Awaiting feedback</small>
          </article>
        </div>
      </section>

      <section className="portfolio-card">
        <h2>Portfolio Completion</h2>
        <p>{dashboardStats.completion}% of your projects have been reviewed</p>
        <div className="progress-wrap large">
          <div
            className="progress-fill"
            style={{ width: `${dashboardStats.completion}%` }}
          />
        </div>
      </section>

      <section className="section-block">
        <div className="title-row">
          <h2 className="section-title">My Projects</h2>
          <button className="create-btn" onClick={createProject}>
            + Create New Project
          </button>
        </div>

        <div className="project-list">
          {loading ? (
            <p>Loading projects...</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : projects.length === 0 ? (
            <p>No projects yet. Create your first project!</p>
          ) : (
            projects.map((project) => (
              <article key={project._id} className="student-card">
                <div className="row-between">
                  <h3>{project.title}</h3>
                  <span className="status-tag">{project.milestone}</span>
                </div>
                <p>{project.description}</p>
                <p>
                  <strong>Media Upload:</strong> {project.media}
                </p>
                <div className="progress-wrap">
                  <div
                    className="progress-fill"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <p className="progress-label">Progress: {project.progress}%</p>
                {project.reviewed && (
                  <p className="text-success">✓ Reviewed</p>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default StudentDashboard;
