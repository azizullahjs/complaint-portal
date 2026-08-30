import { Router } from "express";
import { Parser as CsvParser } from "json2csv";
import Complaint from "../models/Complaint.js";
import { requireAuth, requireRole, attachUserIfPresent } from "../middleware/auth.js";
import { calculatePriority } from "../utils/priority.js";

const router = Router();

function buildFilter(query) {
  const filter = {};

  if (query.category) filter.category = query.category;
  if (query.status) filter.status = query.status;
  if (query.area) filter.area = { $regex: query.area, $options: "i" };
  if (query.priority) filter.priority = query.priority;
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }

  return filter;
}

router.get("/check-duplicate", async (req, res) => {
  try {
    const { category, area } = req.query;
    if (!category || !area) {
      return res.json([]);
    }

    const duplicates = await Complaint.find({
      category,
      area: { $regex: `^${area}$`, $options: "i" },
      status: { $ne: "resolved" },
    })
      .sort({ upvotes: -1 })
      .limit(5)
      .select("title upvotes");

    res.json(duplicates);
  } catch (err) {
    console.error("[CHECK DUPLICATE ERROR]", err.message);
    res.status(500).json({ message: "could not check for duplicates" });
  }
});

router.get("/mine", requireAuth, async (req, res) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error("[GET MY COMPLAINTS ERROR]", err.message);
    res.status(500).json({ message: "could not load your complaints" });
  }
});

router.get("/export", requireAuth, requireRole("officer"), async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const complaints = await Complaint.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const rows = complaints.map((c) => ({
      id: c._id.toString(),
      title: c.title,
      category: c.category,
      area: c.area,
      status: c.status,
      priority: c.priority,
      upvotes: c.upvotes,
      filedBy: c.createdBy?.name || "",
      filedByEmail: c.createdBy?.email || "",
      createdAt: c.createdAt.toISOString(),
    }));

    const parser = new CsvParser({
      fields: [
        "id",
        "title",
        "category",
        "area",
        "status",
        "priority",
        "upvotes",
        "filedBy",
        "filedByEmail",
        "createdAt",
      ],
    });
    const csv = parser.parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment(`complaints_export_${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(csv);
  } catch (err) {
    console.error("[EXPORT COMPLAINTS ERROR]", err.message);
    res.status(500).json({ message: "could not export complaints" });
  }
});

router.get("/", async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error("[GET ALL COMPLAINTS ERROR]", err.message);
    res.status(500).json({ message: "could not load complaints" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("createdBy", "name email");
    if (!complaint) {
      return res.status(404).json({ message: "complaint not found" });
    }
    res.json(complaint);
  } catch (err) {
    console.error("[GET COMPLAINT ERROR]", err.message);
    res.status(404).json({ message: "complaint not found" });
  }
});

router.post("/", requireAuth, requireRole("citizen"), async (req, res) => {
  try {
    const { title, category, description, area } = req.body;
    if (!title || !category || !description || !area) {
      return res.status(400).json({ message: "title, category, description and area are required" });
    }
    
    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ message: "title must be a non-empty string" });
    }
    if (typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ message: "description must be a non-empty string" });
    }
    if (typeof area !== 'string' || area.trim().length === 0) {
      return res.status(400).json({ message: "area must be a non-empty string" });
    }

    const priority = calculatePriority(category, 0);

    const complaint = await Complaint.create({
      title: title.trim(),
      category,
      description: description.trim(),
      area: area.trim(),
      priority,
      createdBy: req.user._id,
    });

    res.status(201).json(complaint);
  } catch (err) {
    console.error("[CREATE COMPLAINT ERROR]", err.message);
    res.status(500).json({ message: "could not submit complaint - please try again" });
  }
});

router.patch("/:id/upvote", requireAuth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "complaint not found" });
    }

    const alreadyUpvoted = complaint.upvotedBy.some(
      (userId) => userId.toString() === req.user._id.toString()
    );
    if (alreadyUpvoted) {
      return res.status(400).json({ message: "you already upvoted this complaint" });
    }

    complaint.upvotedBy.push(req.user._id);
    complaint.upvotes += 1;
    complaint.priority = calculatePriority(complaint.category, complaint.upvotes);
    await complaint.save();

    res.json(complaint);
  } catch (err) {
    console.error("[UPVOTE COMPLAINT ERROR]", err.message);
    res.status(500).json({ message: "could not upvote complaint" });
  }
});

router.patch("/:id/status", requireAuth, requireRole("officer"), async (req, res) => {
  try {
    const { status, remark } = req.body;
    const allowedStatuses = ["pending", "in-progress", "resolved"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "invalid status" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "complaint not found" });
    }

    const justResolved = status === "resolved" && complaint.status !== "resolved";

    complaint.status = status;
    complaint.officerRemark = remark || "";
    if (justResolved) complaint.feedbackPending = true;

    await complaint.save();
    res.json(complaint);
  } catch (err) {
    console.error("[UPDATE COMPLAINT STATUS ERROR]", err.message);
    res.status(500).json({ message: "could not update complaint" });
  }
});

router.patch("/:id/feedback", requireAuth, requireRole("citizen"), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "rating must be between 1 and 5" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "complaint not found" });
    }
    if (complaint.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "not authorized" });
    }

    complaint.feedback = { rating: numericRating, comment: comment || "" };
    complaint.feedbackPending = false;
    await complaint.save();

    res.json(complaint);
  } catch (err) {
    console.error("[SUBMIT FEEDBACK ERROR]", err.message);
    res.status(500).json({ message: "could not submit feedback" });
  }
});

export default router;
