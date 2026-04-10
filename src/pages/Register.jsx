{mode === "register" && (
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
      placeholder="Email (e.g. arjun@example.com)"
      type="email"
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