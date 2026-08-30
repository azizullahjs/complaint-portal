import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CitizenDashboard() {
  const { user } = useAuth();

  return (
    <div className="page">
      <h1>Welcome back, {user?.name}</h1>
      <div className="tile-grid">
        <Link to="/complaints/new" className="tile">
          <h3>Report a Complaint</h3>
          <p>Something broken near you? File it in under a minute.</p>
        </Link>
        <Link to="/complaints/mine" className="tile">
          <h3>My Complaints</h3>
          <p>Track the status of issues you've reported.</p>
        </Link>
        <Link to="/complaints" className="tile">
          <h3>Browse Complaints</h3>
          <p>See what's already been reported in your area.</p>
        </Link>
      </div>
    </div>
  );
}
