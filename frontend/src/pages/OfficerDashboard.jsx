import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import PriorityBadge from "../components/PriorityBadge";

const categories = ["", "Road", "Garbage", "Water", "Electricity", "Other"];
const statuses = ["", "pending", "in-progress", "resolved"];
const priorities = ["", "Low", "Medium", "High", "Critical"];

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({ search: "", category: "", status: "", area: "", priority: "" });
  const [briefing, setBriefing] = useState("");
  const [briefingLoading, setBriefingLoading] = useState(true);

  function load() {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    api.get("/complaints", { params }).then((res) => setComplaints(res.data));
  }

  useEffect(load, [filters]);

  useEffect(() => {
    setBriefingLoading(true);
    api
      .post("/ai/officer-summary")
      .then((res) => setBriefing(res.data.summary))
      .catch(() => setBriefing("Could not generate a briefing right now."))
      .finally(() => setBriefingLoading(false));
  }, []);

  function downloadCsv() {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v && k !== "priority") params.append(k, v);
    });
    const token = localStorage.getItem("token");
    fetch(`/api/complaints/export?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `complaints_export_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  return (
    <div className="page">
      <h1>Officer Dashboard</h1>

      <div className="briefing-card">
        <h3>Today's Briefing</h3>
        {briefingLoading ? <p className="muted">generating briefing...</p> : <p>{briefing}</p>}
      </div>

      <div className="filter-bar">
        <input
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <select value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c || "All categories"}
            </option>
          ))}
        </select>
        <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s || "All statuses"}
            </option>
          ))}
        </select>
        <select value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}>
          {priorities.map((p) => (
            <option key={p} value={p}>
              {p || "All priorities"}
            </option>
          ))}
        </select>
        <input
          placeholder="Area"
          value={filters.area}
          onChange={(e) => setFilters((f) => ({ ...f, area: e.target.value }))}
        />
        <button className="btn" onClick={downloadCsv}>
          Download CSV
        </button>
      </div>

      <table className="complaint-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Area</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Upvotes</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c._id}>
              <td>
                <Link to={`/officer/complaints/${c._id}`}>{c.title}</Link>
              </td>
              <td>{c.category}</td>
              <td>{c.area}</td>
              <td>{c.status}</td>
              <td>
                <PriorityBadge level={c.priority} />
              </td>
              <td>{c.upvotes}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {complaints.length === 0 && <p className="muted">No complaints match these filters.</p>}
    </div>
  );
}
