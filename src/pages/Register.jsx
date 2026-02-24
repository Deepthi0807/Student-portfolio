function Register() {
  return (
    <div className="auth-wrapper">
      <div className="container">
        <h2>Register</h2>

        <input placeholder="Full Name" />
        <input placeholder="Username" />
        <input type="password" placeholder="Password" />

        <button>Register</button>
      </div>
    </div>
  );
}

export default Register;
