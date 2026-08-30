import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function toPublicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: "name must be a non-empty string" });
    }
    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ message: "email must be a valid email address" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "an account with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const allowedRole = role === "officer" ? "officer" : "citizen";

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashed,
      role: allowedRole,
    });

    res.status(201).json({ user: toPublicUser(user) });
  } catch (err) {
    console.error("[SIGNUP ERROR]", err.message);
    res.status(500).json({ message: "signup failed - please try again" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "invalid email or password" });
    }

    const token = signToken(user);
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error("[LOGIN ERROR]", err.message);
    res.status(500).json({ message: "login failed - please try again" });
  }
});

export default router;
