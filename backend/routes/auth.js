const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");

// There's no User collection at all — this app has exactly one admin,
// and its credentials live in environment variables. Simpler than a
// full user system, and still teaches the real login flow: check
// credentials, sign a token, return it.
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const validUsername = username === process.env.ADMIN_USERNAME;
  const validPassword = password === process.env.ADMIN_PASSWORD;

  if (!validUsername || !validPassword) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // The payload is what requireAdmin checks later — role is fixed to
  // "admin" since this is the only account that can ever log in.
  const token = jwt.sign(
    { username, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, user: { username, role: "admin" } });
});

// GET /api/auth/me — lets the frontend confirm a stored token is still
// valid after a page refresh. No DB lookup needed: if the signature and
// expiry check out, the payload itself is the answer.
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: { username: req.user.username, role: req.user.role } });
});

module.exports = router;
