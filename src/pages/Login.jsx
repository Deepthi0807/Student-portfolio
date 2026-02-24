import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DEMO_USERS = [
  {
    username: "arjun.student",
    password: "Arjun@123",
    role: "student",
    name: "Arjun Kumar",
    studentId: "240003001",
  },
  {
    username: "priya.student",
    password: "Priya@123",
    role: "student",
    name: "Priya Sharma",
    studentId: "240003002",
  },
  {
    username: "meera.admin",
    password: "Meera@123",
    role: "admin",
    name: "Meera Iyer",
  },
];

function Login({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleLogin = () => {
    const account = DEMO_USERS.find(
      (user) =>
        user.username === form.username.trim() &&
        user.password === form.password.trim()
    );

    if (!account) {
      setError("Invalid username or password.");
      return;
    }

    setError("");
    const route = account.role === "admin" ? "/admin" : "/student";
    navigate(route, { state: { user: account } });
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
        <p className="auth-subtitle">Login as student or admin</p>

        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
        />
        <input
          name="password"
          value={form.password}
          onChange={handleChange}
          type="password"
          placeholder="Password"
        />

        <button onClick={handleLogin}>Login</button>

        {error && <p className="error-text">{error}</p>}

        <div className="demo-users">
          <h4>Demo Accounts</h4>
          <p>Student: arjun.student / Arjun@123</p>
          <p>Student: priya.student / Priya@123</p>
          <p>Admin: meera.admin / Meera@123</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
