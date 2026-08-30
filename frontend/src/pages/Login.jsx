import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.token, res.data.user);
      navigate(res.data.user.role === "officer" ? "/officer/dashboard" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "login failed");
    }
  }

  return (
    <div className="page narrow">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="form">
        {error && <p className="error">{error}</p>}
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          required
        />
        <label>Password</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          required
        />
        <button type="submit" className="btn primary">
          Login
        </button>
      </form>
      <p className="muted">
        Need an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
