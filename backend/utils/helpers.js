const str = (v, max) => String(v ?? "").trim().slice(0, max);
// Returns "" for empty, the URL if it starts with http(s), otherwise null (invalid).
const url = (v) => { v = str(v, 200); return v === "" || /^https?:\/\//i.test(v) ? v : null; };
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
module.exports = { str, url, wrap };
