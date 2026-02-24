import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const INITIAL_PROJECTS = [
  {
    id: 1,
    title: "Smart Attendance System",
    description: "Face-recognition enabled attendance workflow for classrooms.",
    milestone: "Prototype Completed",
    progress: 78,
    media: "attendance-demo.mp4",
    reviewed: true,
  },
  {
    id: 2,
    title: "Data Visualizer",
    description: "Interactive dashboard for semester project outcomes.",
    milestone: "Awaiting Feedback",
    progress: 55,
    media: "charts-screenshots.zip",
    reviewed: false,
  },
];

function StudentDashboard({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeUser =
    location.state?.user ||
    {
      name: "Arjun Kumar",
      studentId: "240003001",
    };

  const [projects, setProjects] = useState(INITIAL_PROJECTS);

  const dashboardStats = useMemo(() => {
    const total = projects.length;
    const reviewed = projects.filter((project) => project.reviewed).length;
    const pending = total - reviewed;
    const completion = total === 0 ? 0 : Math.round((reviewed / total) * 100);

    return { total, reviewed, pending, completion };
  }, [projects]);

  const createProject = () => {
    const newProject = {
      id: Date.now(),
      title: `New Project ${projects.length + 1}`,
      description: "Add your project summary, milestone, and media uploads.",
      milestone: "Planning",
      progress: 0,
      media: "No media uploaded",
      reviewed: false,
    };

    setProjects((prev) => [newProject, ...prev]);
  };

  const logout = () => {
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
          {projects.map((project) => (
            <article key={project.id} className="student-card">
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
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default StudentDashboard;
