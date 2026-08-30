import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const categories = ["Road", "Garbage", "Water", "Electricity", "Other"];

export default function NewComplaint() {
  const [form, setForm] = useState({ title: "", category: "Road", description: "", area: "" });
  const [error, setError] = useState("");
  const [duplicates, setDuplicates] = useState([]);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setDuplicates([]);
  }

  async function checkForDuplicates() {
    if (!form.category || !form.area) return;
    setChecking(true);
    try {
      const res = await api.get("/complaints/check-duplicate", {
        params: { category: form.category, area: form.area },
      });
      setDuplicates(res.data);
    } finally {
      setChecking(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/complaints", form);
      navigate(`/complaints/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "could not submit complaint");
    }
  }

  async function upvoteInstead(id) {
    await api.patch(`/complaints/${id}/upvote`);
    navigate(`/complaints/${id}`);
  }

  return (
    <div className="page narrow">
      <h1>Report a Complaint</h1>
      <form onSubmit={handleSubmit} className="form">
        {error && <p className="error">{error}</p>}
        <label>Title</label>
        <input value={form.title} onChange={(e) => update("title", e.target.value)} required />

        <label>Category</label>
        <select value={form.category} onChange={(e) => update("category", e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label>Area / Locality</label>
        <input
          value={form.area}
          onChange={(e) => update("area", e.target.value)}
          onBlur={checkForDuplicates}
          required
        />

        <label>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          required
        />

        {checking && <p className="muted">checking for similar complaints...</p>}

        {duplicates.length > 0 && (
          <div className="duplicate-warning">
            <p>A similar complaint already exists in your area. Upvote it instead?</p>
            {duplicates.map((d) => (
              <div key={d._id} className="duplicate-row">
                <span>{d.title} ({d.upvotes} upvotes)</span>
                <button type="button" onClick={() => upvoteInstead(d._id)} className="btn small">
                  Upvote this
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="btn primary">
          Submit Complaint
        </button>
      </form>
    </div>
  );
}
