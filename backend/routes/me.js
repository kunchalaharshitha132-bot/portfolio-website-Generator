const router = require("express").Router();
const db = require("../supabase");
const auth = require("../middleware/auth");
const { str, url, wrap } = require("../utils/helpers");
const THEMES = ["ocean", "forest", "sunset", "mono"];

router.use(auth);

router.get("/", wrap(async (req, res) => {
  const id = req.userId;
  const [u, p, pr, sk] = await Promise.all([
    db.from("users").select("username,email").eq("id", id).single(),
    db.from("portfolios").select("*").eq("user_id", id).single(),
    db.from("projects").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    db.from("skills").select("*").eq("user_id", id).order("created_at"),
  ]);
  const err = u.error || p.error || pr.error || sk.error;
  if (err) throw err;
  res.json({ user: u.data, portfolio: p.data, projects: pr.data, skills: sk.data });
}));

router.put("/portfolio", wrap(async (req, res) => {
  const b = req.body;
  const row = {
    full_name: str(b.full_name, 80), headline: str(b.headline, 120), bio: str(b.bio, 1000),
    theme: THEMES.includes(b.theme) ? b.theme : "ocean",
    public_email: str(b.public_email, 120), github: url(b.github), linkedin: url(b.linkedin),
    updated_at: new Date().toISOString(),
  };
  if (!row.full_name) return res.status(400).json({ error: "Full name is required." });
  if (row.github === null || row.linkedin === null) return res.status(400).json({ error: "Links must start with http:// or https://" });
  const { error } = await db.from("portfolios").update(row).eq("user_id", req.userId);
  if (error) throw error;
  res.json({ ok: true });
}));

router.post("/projects", wrap(async (req, res) => {
  const row = { user_id: req.userId, title: str(req.body.title, 80), description: str(req.body.description, 500), link: url(req.body.link), tech: str(req.body.tech, 120) };
  if (!row.title) return res.status(400).json({ error: "Project title is required." });
  if (row.link === null) return res.status(400).json({ error: "Link must start with http:// or https://" });
  const { error } = await db.from("projects").insert(row);
  if (error) throw error;
  res.status(201).json({ ok: true });
}));

router.delete("/projects/:id", wrap(async (req, res) => {
  const { error } = await db.from("projects").delete().eq("id", req.params.id).eq("user_id", req.userId);
  if (error) return res.status(400).json({ error: "Could not delete project." });
  res.json({ ok: true });
}));

router.post("/skills", wrap(async (req, res) => {
  const name = str(req.body.name, 40);
  const level = parseInt(req.body.level, 10);
  if (!name) return res.status(400).json({ error: "Skill name is required." });
  if (!(level >= 1 && level <= 5)) return res.status(400).json({ error: "Level must be 1 to 5." });
  const { error } = await db.from("skills").insert({ user_id: req.userId, name, level });
  if (error) {
    if (error.code === "23505") return res.status(409).json({ error: "You already added that skill." });
    throw error;
  }
  res.status(201).json({ ok: true });
}));

router.delete("/skills/:id", wrap(async (req, res) => {
  const { error } = await db.from("skills").delete().eq("id", req.params.id).eq("user_id", req.userId);
  if (error) return res.status(400).json({ error: "Could not delete skill." });
  res.json({ ok: true });
}));

module.exports = router;
