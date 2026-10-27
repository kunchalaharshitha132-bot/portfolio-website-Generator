const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const db = require("../supabase");
const { str, wrap } = require("../utils/helpers");

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { error: "Too many attempts. Try again later." } });
const cookieOpts = { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 3600 * 1000 };
const sign = (res, id) => res.cookie("token", jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" }), cookieOpts);

router.post("/register", limiter, wrap(async (req, res) => {
  const username = str(req.body.username, 20).toLowerCase();
  const email = str(req.body.email, 120).toLowerCase();
  const password = String(req.body.password || "");
  if (!/^[a-z0-9_-]{3,20}$/.test(username)) return res.status(400).json({ error: "Username must be 3-20 letters, numbers, - or _." });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Enter a valid email address." });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });

  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await db.from("users").insert({ username, email, password_hash }).select("id").single();
  if (error) {
    if (error.code === "23505") return res.status(409).json({ error: "Username or email is already taken." });
    throw error;
  }
  const p = await db.from("portfolios").insert({ user_id: data.id, full_name: username });
  if (p.error) throw p.error;
  sign(res, data.id);
  res.status(201).json({ ok: true });
}));

router.post("/login", limiter, wrap(async (req, res) => {
  const email = str(req.body.email, 120).toLowerCase();
  const { data } = await db.from("users").select("id,password_hash").eq("email", email).maybeSingle();
  if (!data || !(await bcrypt.compare(String(req.body.password || ""), data.password_hash)))
    return res.status(401).json({ error: "Wrong email or password." });
  sign(res, data.id);
  res.json({ ok: true });
}));

router.post("/logout", (req, res) => { res.clearCookie("token"); res.json({ ok: true }); });
module.exports = router;
