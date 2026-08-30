import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import PriorityBadge from "../components/PriorityBadge";
import { useAuth } from "../context/AuthContext";

const categories = ["", "Road", "Garbage", "Water", "Electricity", "Other"];
const statuses = ["", "pending", "in-progress", "resolved"];

export default function BrowseComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({ search: "", category: "", status: "", area: "" });
  const { user } = useAuth();

  function load() {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    api.get("/complaints", { params }).then((res) => setComplaints(res.data));
  }

  useEffect(load, [filters]);

  async function upvote(id) {
    try {
      await api.patch(`/complaints/${id}/upvote`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "could not upvote");
    }
  }

  return (
    <div className="page">
      <h1>Browse Complaints</h1>

      <div className="filter-bar">
        <input
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c || "All categories"}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s || "All statuses"}
            </option>
          ))}
        </select>
        <input
          placeholder="Area"
          value={filters.area}
          onChange={(e) => setFilters((f) => ({ ...f, area: e.target.value }))}
        />
      </div>

      <div className="card-grid">
        {complaints.map((c) => (
          <div key={c._id} className="complaint-card">
            <div className="card-top">
              <span className="category-tag">{c.category}</span>
              <PriorityBadge level={c.priority} />
            </div>
            <Link to={`/complaints/${c._id}`}>
              <h3>{c.title}</h3>
            </Link>
            <p className="muted">{c.area}</p>
            <p className={`status-pill ${c.status}`}>{c.status}</p>
            <div className="card-bottom">
              <span>{c.upvotes} upvotes</span>
              {user && (
                <button className="btn small" onClick={() => upvote(c._id)}>
                  Upvote
                </button>
              )}
            </div>
          </div>
        ))}
        {complaints.length === 0 && <p className="muted">No complaints match these filters.</p>}
      </div>
    </div>
  );
}
