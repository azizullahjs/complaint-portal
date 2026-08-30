import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import PriorityBadge from "../components/PriorityBadge";

export default function OfficerComplaintReview() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState("pending");
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  function load() {
    api.get(`/complaints/${id}`).then((res) => {
      setComplaint(res.data);
      setStatus(res.data.status);
      setRemark(res.data.officerRemark || "");
    });
  }

  useEffect(load, [id]);

  async function handleUpdate() {
    setSaving(true);
    try {
      await api.patch(`/complaints/${id}/status`, { status, remark });
      load();
    } finally {
      setSaving(false);
    }
  }

  if (!complaint) return <div className="page">Loading...</div>;

  return (
    <div className="page narrow">
      <button className="link-btn" onClick={() => navigate("/officer/dashboard")}>
        &larr; back to dashboard
      </button>

      <div className="card-top">
        <span className="category-tag">{complaint.category}</span>
        <PriorityBadge level={complaint.priority} />
      </div>
      <h1>{complaint.title}</h1>
      <p className="muted">
        {complaint.area} · filed by {complaint.createdBy?.name} ({complaint.createdBy?.email})
      </p>
      {complaint.imageUrl && <img src={complaint.imageUrl} alt="" className="complaint-image" />}
      <p>{complaint.description}</p>
      <p className="muted">{complaint.upvotes} upvotes</p>

      <div className="form">
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <label>Remark</label>
        <textarea
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          rows={3}
          placeholder="e.g. Team assigned, will fix by Friday"
        />

        <button className="btn primary" onClick={handleUpdate} disabled={saving}>
          {saving ? "Saving..." : "Update"}
        </button>
      </div>
    </div>
  );
}
