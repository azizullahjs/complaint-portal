

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar professional-navbar">
      <Link to="/" className="brand professional-brand">
        Public Complaint
      </Link>

      <div className="nav-links professional-nav-links">
        <Link to="/complaints">Browse</Link>

        {user && user.role === "citizen" && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/complaints/new">Report Issue</Link>
            <Link to="/complaints/mine">My Complaints</Link>
          </>
        )}

        {user && user.role === "officer" && (
          <Link to="/officer/dashboard">Officer Dashboard</Link>
        )}

        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}

        {user && (
          <button onClick={handleLogout} className="link-btn">
            Logout ({user.name})
          </button>
        )}
      </div>
    </nav>
  );
}

