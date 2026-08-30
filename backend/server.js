import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import complaintRoutes from "./routes/complaints.js";
import aiRoutes from "./routes/ai.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/ai", aiRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

app.use((req, res) => {
  res.status(404).json({ message: "endpoint not found" });
});

app.use((err, req, res, next) => {
  console.error("[ERROR]", {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
  });
  res.status(err.status || 500).json({ 
    message: err.message || "internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("MONGO_URI is missing. Check that backend/.env exists and is loaded correctly.");
  process.exit(1);
}

const placeholderPatterns = [
  "<db_password>",
  "REPLACE_WITH_YOUR_ACTUAL_MONGO_PASSWORD",
  "username",
  "password",
  "YOUR_MONGO_PASSWORD",
];

if (placeholderPatterns.some((pattern) => mongoUri.toLowerCase().includes(pattern.toLowerCase()))) {
  console.error("MONGO_URI still contains a placeholder or invalid value. Replace the database password in backend/.env with the real Atlas password.");
  console.error("Atlas auth failure usually means the password in the URI is wrong or not URL-encoded if it contains special characters like @, :, /, or #.");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Check that backend/.env exists and is loaded correctly.");
  process.exit(1);
}

console.log("connecting to MongoDB...");

mongoose
  .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("failed to connect to MongoDB");
    console.error(err.message);
    console.error(
      "common causes: your IP is not whitelisted in MongoDB Atlas (Network Access -> Add IP Address -> Allow Access From Anywhere for testing), or the username/password in MONGO_URI is wrong."
    );
    process.exit(1);
  });

process.on("unhandledRejection", (err) => {
  console.error("unhandled promise rejection:", err);
});
