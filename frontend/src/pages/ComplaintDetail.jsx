import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import PriorityBadge from "../components/PriorityBadge";
import { useAuth } from "../context/AuthContext";

export default function ComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const { user } = useAuth();

  function load() {
    api.get(`/complaints/${id}`).then((res) => setComplaint(res.data));
  }

  useEffect(load, [id]);

  async function upvote() {
    try {
      await api.patch(`/complaints/${id}/upvote`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "could not upvote");
    }
  }

  if (!complaint) return <div className="page">Loading...</div>;

  return (
    <div className="page narrow">
      <div className="card-top">
        <span className="category-tag">{complaint.category}</span>
        <PriorityBadge level={complaint.priority} />
      </div>
      <h1>{complaint.title}</h1>
      <p className="muted">
        {complaint.area} · filed by {complaint.createdBy?.name || "a citizen"} on{" "}
        {new Date(complaint.createdAt).toLocaleDateString()}
      </p>
      <p className={`status-pill ${complaint.status}`}>{complaint.status}</p>
      {complaint.imageUrl && <img src={complaint.imageUrl} alt="" className="complaint-image" />}
      <p>{complaint.description}</p>

      {complaint.officerRemark && (
        <div className="remark-box">
          <strong>Officer remark:</strong>
          <p>{complaint.officerRemark}</p>
        </div>
      )}

      <div className="card-bottom">
        <span>{complaint.upvotes} upvotes</span>
        {user && (
          <button className="btn small" onClick={upvote}>
            Upvote
          </button>
        )}
      </div>
    </div>
  );
}
