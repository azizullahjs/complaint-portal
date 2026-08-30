import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Road", "Garbage", "Water", "Electricity", "Other"],
      required: true,
    },
    description: { type: String, required: true },
    area: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    officerRemark: { type: String, default: "" },
    feedbackPending: { type: Boolean, default: false },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

complaintSchema.index({ title: "text", description: "text" });

export default mongoose.model("Complaint", complaintSchema);
