import { Router } from "express";
import Complaint from "../models/Complaint.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/officer-summary", requireAuth, requireRole("officer"), async (req, res) => {
  try {
    const complaints = await Complaint.find({ status: { $ne: "resolved" } });

    const total = complaints.length;
    const critical = complaints.filter((c) => c.priority === "Critical").length;
    const high = complaints.filter((c) => c.priority === "High").length;

    const byCategory = {};
    complaints.forEach((c) => {
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    });
    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

    const byArea = {};
    complaints.forEach((c) => {
      byArea[c.area] = (byArea[c.area] || 0) + 1;
    });
    const topArea = Object.entries(byArea).sort((a, b) => b[1] - a[1])[0];

    const mostUpvoted = [...complaints].sort((a, b) => b.upvotes - a.upvotes)[0];

    if (total === 0) {
      return res.json({ summary: "No open complaints right now. Great time to review resolved cases." });
    }

    const parts = [
      `${total} open complaint${total === 1 ? "" : "s"}`,
      critical > 0 ? `${critical} marked Critical` : null,
      high > 0 ? `${high} marked High priority` : null,
      topCategory ? `most reports are in ${topCategory[0]} (${topCategory[1]})` : null,
      topArea ? `${topArea[0]} has the most open reports (${topArea[1]})` : null,
      mostUpvoted ? `the most upvoted issue is "${mostUpvoted.title}" with ${mostUpvoted.upvotes} upvotes` : null,
    ].filter(Boolean);

    res.json({ summary: parts.join(". ") + "." });
  } catch (err) {
    console.error("[OFFICER SUMMARY ERROR]", err.message);
    res.status(500).json({ message: "could not generate briefing" });
  }
});

export default router;
