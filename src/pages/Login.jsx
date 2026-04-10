import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../api/api";

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

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((previous) => ({ ...previous, [name]: value }));
  };

  // ── LOGIN ──────────────────────────────────────────────
  const handleLogin = async () => {
    const username = loginForm.username.trim();
    const password = loginForm.password.trim();

    if (!username || !password) {
      setError("Please enter username and password.");
      setSuccess("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login({ username, password });

      localStorage.setItem("token", response.token);

      const route = response.user.role === "admin" ? "/admin" : "/student";
      navigate(route, { state: { user: response.user } });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── REGISTER ───────────────────────────────────────────
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

        {/* Tab Switch */}
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

        {/* Login Form */}
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
          /* Register Form */
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