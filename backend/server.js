require("dotenv").config();
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const app = express();
app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/me", require("./routes/me"));
app.use("/api/public", require("./routes/public"));
app.use("/api", (req, res) => res.status(404).json({ error: "Endpoint not found" }));

const FRONTEND = path.join(__dirname, "..", "frontend");
app.use(express.static(FRONTEND));
app.get("/p/:username", (req, res) => res.sendFile(path.join(FRONTEND, "portfolio.html")));

// Centralized error handler: never leak internal details.
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: "Something went wrong on the server." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
