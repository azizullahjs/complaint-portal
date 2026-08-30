import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import PriorityBadge from "../components/PriorityBadge";

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [ratingDrafts, setRatingDrafts] = useState({});

  function load() {
    api.get("/complaints/mine").then((res) => setComplaints(res.data));
  }

  useEffect(load, []);

  function updateDraft(id, field, value) {
    setRatingDrafts((d) => ({ ...d, [id]: { ...d[id], [field]: value } }));
  }

  async function submitFeedback(id) {
    const draft = ratingDrafts[id] || { rating: 5, comment: "" };
    await api.patch(`/complaints/${id}/feedback`, draft);
    load();
  }

  return (
    <div className="page">
      <h1>My Complaints</h1>
      <div className="complaint-list">
        {complaints.map((c) => (
          <div key={c._id} className="complaint-row">
            <div>
              <Link to={`/complaints/${c._id}`}>
                <strong>{c.title}</strong>
              </Link>
              <p className="muted">
                {c.category} · {c.area} · filed {new Date(c.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="row-right">
              <PriorityBadge level={c.priority} />
              <span className={`status-pill ${c.status}`}>{c.status}</span>
            </div>

            {c.status === "resolved" && c.feedbackPending && (
              <div className="feedback-box">
                <p>Was your issue resolved? Rate the response.</p>
                <select
                  value={ratingDrafts[c._id]?.rating || 5}
                  onChange={(e) => updateDraft(c._id, "rating", Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="optional comment"
                  value={ratingDrafts[c._id]?.comment || ""}
                  onChange={(e) => updateDraft(c._id, "comment", e.target.value)}
                />
                <button className="btn small" onClick={() => submitFeedback(c._id)}>
                  Submit Rating
                </button>
              </div>
            )}
          </div>
        ))}
        {complaints.length === 0 && <p className="muted">You haven't filed any complaints yet.</p>}
      </div>
    </div>
  );
}
