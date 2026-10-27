const router = require("express").Router();
const db = require("../supabase");
const { wrap } = require("../utils/helpers");

// Public: anyone can view a portfolio. Only portfolio fields are returned (no login email/password).
router.get("/:username", wrap(async (req, res) => {
  const { data: u } = await db.from("users").select("id").eq("username", req.params.username.toLowerCase()).maybeSingle();
  if (!u) return res.status(404).json({ error: "Portfolio not found." });
  const [p, pr, sk] = await Promise.all([
    db.from("portfolios").select("full_name,headline,bio,theme,public_email,github,linkedin").eq("user_id", u.id).single(),
    db.from("projects").select("title,description,link,tech").eq("user_id", u.id).order("created_at", { ascending: false }),
    db.from("skills").select("name,level").eq("user_id", u.id).order("created_at"),
  ]);
  const err = p.error || pr.error || sk.error;
  if (err) throw err;
  res.json({ portfolio: p.data, projects: pr.data, skills: sk.data });
}));
module.exports = router;
