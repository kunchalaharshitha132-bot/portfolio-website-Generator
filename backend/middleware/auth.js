const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  try {
    const payload = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    req.userId = payload.id; // taken from the signed token, never from the request body
    next();
  } catch {
    res.status(401).json({ error: "Please log in." });
  }
};
