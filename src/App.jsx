import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((previous) => (previous === "dark" ? "light" : "dark"));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Login theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/student"
          element={
            <StudentDashboard theme={theme} onToggleTheme={toggleTheme} />
          }
        />
        <Route
          path="/admin"
          element={<AdminDashboard theme={theme} onToggleTheme={toggleTheme} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
