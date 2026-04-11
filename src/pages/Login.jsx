import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../api/api";

const LOCAL_USERS_KEY = "portal_users";

function Login({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const getLocalUsers = () => {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const setLocalUsers = (users) => {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  };

  const isNetworkError = (message = "") =>
    message.includes("Failed to fetch") || message.includes("NetworkError");

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((previous) => ({ ...previous, [name]: value }));
  };

  const fallbackLocalRegister = ({ name, email, username, password }) => {
    const users = getLocalUsers();
    const exists = users.some((user) => user.username === username);
    if (exists) {
      throw new Error("Username already exists.");
    }

    const role = username.toLowerCase().includes("admin") ? "admin" : "student";
    const studentCount = users.filter((user) => user.role === "student").length;

    const localUser = {
      id: `local-${Date.now()}`,
      name,
      email,
      username,
      password,
      role,
      studentId:
        role === "student"
          ? `240003${String(studentCount + 1).padStart(3, "0")}`
          : "",
    };

    setLocalUsers([...users, localUser]);
  };

  const handleLogin = async () => {
    const username = loginForm.username.trim() || "guest";
    const password = loginForm.password.trim() || "guest";
    const role = username.toLowerCase().includes("admin") ? "admin" : "student";

    const users = getLocalUsers();
    const existingUser = users.find((user) => user.username === username);

    const fallbackStudentCount = users.filter((user) => user.role === "student").length;
    const user =
      existingUser ||
      {
        id: `local-${Date.now()}`,
        name: username,
        email: `${username}@local.dev`,
        username,
        password,
        role,
        studentId:
          role === "student"
            ? `240003${String(fallbackStudentCount + 1).padStart(3, "0")}`
            : "",
      };

    if (!existingUser) {
      setLocalUsers([...users, user]);
    }

    setError("");
    setSuccess("");
    const route = user.role === "admin" ? "/admin" : "/student";
    navigate(route, { state: { user } });
  };

  const handleRegister = async () => {
    const name = registerForm.name.trim();
    const email = registerForm.email.trim();
    const username = registerForm.username.trim();
    const password = registerForm.password.trim();
    const confirmPassword = registerForm.confirmPassword.trim();

    if (!name || !email || !username || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      setSuccess("");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setSuccess("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authAPI.register({ name, email, username, password, confirmPassword });
      setSuccess("Registration successful! You can now sign in.");
      setMode("login");
      setRegisterForm({
        name: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
      });
      setLoginForm({ username, password: "" });
    } catch (err) {
      if (isNetworkError(err.message)) {
        try {
          fallbackLocalRegister({ name, email, username, password });
          setSuccess("Registration successful! You can now sign in.");
          setMode("login");
          setRegisterForm({
            name: "",
            email: "",
            username: "",
            password: "",
            confirmPassword: "",
          });
          setLoginForm({ username, password: "" });
          return;
        } catch (fallbackErr) {
          setError(fallbackErr.message);
          return;
        }
      }

      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="container">
        <div className="auth-topbar">
          <button className="theme-toggle" onClick={onToggleTheme}>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>

        <h2>Project Portfolio Portal</h2>
        <p className="auth-subtitle">Use login or register below</p>

        <div className="auth-switch">
          <button
            className={`switch-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setError("");
              setSuccess("");
            }}
          >
            Login
          </button>
          <button
            className={`switch-btn ${mode === "register" ? "active" : ""}`}
            onClick={() => {
              setMode("register");
              setError("");
              setSuccess("");
            }}
          >
            Register
          </button>
        </div>

        {mode === "login" ? (
          <>
            <input
              name="username"
              value={loginForm.username}
              onChange={handleLoginChange}
              placeholder="Username"
            />
            <input
              name="password"
              value={loginForm.password}
              onChange={handleLoginChange}
              type="password"
              placeholder="Password"
            />
            <button onClick={handleLogin} disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </>
        ) : (
          <>
            <input
              name="name"
              value={registerForm.name}
              onChange={handleRegisterChange}
              placeholder="Full Name (e.g. Arjun Kumar)"
            />
            <input
              name="email"
              value={registerForm.email}
              onChange={handleRegisterChange}
              type="email"
              placeholder="Email (e.g. arjun@example.com)"
            />
            <input
              name="username"
              value={registerForm.username}
              onChange={handleRegisterChange}
              placeholder="Username (include 'admin' for admin role)"
            />
            <input
              name="password"
              value={registerForm.password}
              onChange={handleRegisterChange}
              type="password"
              placeholder="Password"
            />
            <input
              name="confirmPassword"
              value={registerForm.confirmPassword}
              onChange={handleRegisterChange}
              type="password"
              placeholder="Confirm Password"
            />
            <button onClick={handleRegister} disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </>
        )}

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}
      </div>
    </div>
  );
}

export default Login;
