const API_BASE_URL = 'https://backendforfsadstudentportfolio-production.up.railway.app/';

// Helper to get token from localStorage
const getToken = () => localStorage.getItem('token');

// Helper for all API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  } catch (error) {
    throw new Error(`Failed to fetch. Backend not reachable at ${API_BASE_URL}`);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authAPI = {

  // POST /api/auth/login
  // Sends:   { username, password }
  // Returns: { token, user: { id, name, role, studentId, email } }
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  // POST /api/auth/register
  // Sends:   { username, password, confirmPassword }
  // Returns: { token, user: { id, name, role, studentId, email } }
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
};

// ── Student API ───────────────────────────────────────────────────────────────
export const studentAPI = {

  // GET /api/student/projects
  // Returns: [ { _id, title, description, milestone, progress, media, reviewed } ]
  getProjects: () => apiRequest('/student/projects'),

  // POST /api/student/projects
  // Sends:   { title, description, milestone, progress, media }
  // Returns: the newly created project
  createProject: (project) => apiRequest('/student/projects', {
    method: 'POST',
    body: JSON.stringify(project),
  }),

  // PUT /api/student/projects/{id}
  // Sends:   { title, description, milestone, progress, media }
  // Returns: the updated project
  updateProject: (id, project) => apiRequest(`/student/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(project),
  }),

  // DELETE /api/student/projects/{id}
  // Returns: { message: "Project deleted" }
  deleteProject: (id) => apiRequest(`/student/projects/${id}`, {
    method: 'DELETE',
  }),
};

// ── Admin API ─────────────────────────────────────────────────────────────────
export const adminAPI = {

  // GET /api/admin/students
  // Returns: [ { id, name, email, projects, reviewed, pending } ]
  getStudents: () => apiRequest('/admin/students'),

  // GET /api/admin/students/{studentId}/projects
  // studentId = "240003001" (student number string, not DB id)
  // Returns: [ { _id, title, description, milestone, progress, media, reviewed } ]
  getStudentProjects: (studentId) => apiRequest(`/admin/students/${studentId}/projects`),

  // POST /api/admin/projects/{projectId}/feedback
  // Sends:   { comment: "Great work!" }
  // Returns: { message: "Feedback saved successfully" }
  addFeedback: (projectId, feedback) => apiRequest(`/admin/projects/${projectId}/feedback`, {
    method: 'POST',
    body: JSON.stringify({ comment: feedback }),
  }),
};
