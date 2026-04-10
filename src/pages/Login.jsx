import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const USERS_KEY = "portalUsers";

function Login({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const registeredUsers = useMemo(() => {
    const rawUsers = localStorage.getItem(USERS_KEY);
    if (!rawUsers) {
      return [];
    }
    try {
      const parsed = JSON.parse(rawUsers);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [mode]);

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleLogin = () => {
    const username = loginForm.username.trim();
    const password = loginForm.password.trim();

    if (!username || !password) {
      setError("Please enter username and password.");
      setSuccess("");
      return;
    }

    const user = registeredUsers.find(
      (savedUser) => savedUser.username === username && savedUser.password === password
    );

    if (!user) {
      setError("Invalid credentials. Please register first.");
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("");
    const route = user.role === "admin" ? "/admin" : "/student";
    navigate(route, { state: { user } });
  };

  const handleRegister = () => {
    const username = registerForm.username.trim();
    const password = registerForm.password.trim();
    const confirmPassword = registerForm.confirmPassword.trim();

    if (!username || !password || !confirmPassword) {
      setError("Please complete all register fields.");
      setSuccess("");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      setSuccess("");
      return;
    }

    const existingUser = registeredUsers.find(
      (savedUser) => savedUser.username === username
    );
    if (existingUser) {
      setError("Username already exists. Please choose another.");
      setSuccess("");
      return;
    }

    const role = username.toLowerCase().includes("admin") ? "admin" : "student";
    const studentId =
      role === "student"
        ? `240003${String(registeredUsers.length + 1).padStart(3, "0")}`
        : undefined;

    const newUser = {
      username,
      password,
      role,
      name: username,
      studentId,
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([...registeredUsers, newUser]));

    setError("");
    setSuccess("Registration successful. You can now sign in.");
    setMode("login");
    setRegisterForm({ username: "", password: "", confirmPassword: "" });
    setLoginForm({ username, password: "" });
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
            <button onClick={handleLogin}>Sign In</button>
          </>
        ) : (
          <>
            <input
              name="username"
              value={registerForm.username}
              onChange={handleRegisterChange}
              placeholder="Username"
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
            <button onClick={handleRegister}>Register</button>
          </>
        )}

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}
      </div>
    </div>
  );
}

export default Login;
