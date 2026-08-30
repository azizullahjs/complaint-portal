import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import PriorityBadge from "../components/PriorityBadge";

export default function Home() {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get("/complaints").then((res) => setRecent(res.data.slice(0, 4)));
  }, []);

  return (
    <div className="page">
      <section className="hero">
        <h1>Report civic issues in under a minute</h1>
        <p>
          Broken roads, garbage, water supply, streetlights — file it once, track it till it's
          fixed, and see what your neighbours are already reporting.
        </p>
        <div className="hero-actions">
          <Link to="/signup" className="btn primary">
            Get Started
          </Link>
          <Link to="/complaints" className="btn">
            Browse Complaints
          </Link>
        </div>
      </section>

      <section>
        <h2>Recently reported</h2>
        <div className="card-grid">
          {recent.map((c) => (
            <Link to={`/complaints/${c._id}`} key={c._id} className="complaint-card">
              <div className="card-top">
                <span className="category-tag">{c.category}</span>
                <PriorityBadge level={c.priority} />
              </div>
              <h3>{c.title}</h3>
              <p className="muted">{c.area}</p>
              <p className="status">{c.status}</p>
            </Link>
          ))}
          {recent.length === 0 && <p className="muted">Nothing reported yet.</p>}
        </div>
      </section>
    </div>
  );
}
