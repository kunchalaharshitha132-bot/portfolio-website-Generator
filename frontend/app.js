const $ = (s) => document.querySelector(s);
const FIELDS = ["full_name", "headline", "bio", "public_email", "github", "linkedin", "theme"];

async function api(path, method = "GET", body) {
  const res = await fetch("/api" + path, {
    method, headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
function msg(text, ok) { const m = $("#msg"); m.textContent = text; m.className = ok ? "ok" : "err"; }
function clearMsg() { $("#msg").className = ""; }

// Wraps a submit handler so errors show in the message box.
const guard = (fn) => async (e) => { e.preventDefault(); clearMsg(); try { await fn(); } catch (err) { msg(err.message, false); } };

function listRow(parent, text, sub, onDelete) {
  const row = document.createElement("div"); row.className = "row";
  const left = document.createElement("div");
  left.textContent = text; // textContent keeps user input safe from XSS
  if (sub) { const s = document.createElement("div"); s.className = "muted"; s.textContent = sub; left.appendChild(s); }
  const del = document.createElement("button"); del.className = "ghost small"; del.textContent = "Delete";
  del.onclick = async () => { if (confirm("Delete this item?")) { try { await onDelete(); } catch (err) { msg(err.message, false); } } };
  row.append(left, del); parent.appendChild(row);
}
function empty(parent, text) { const p = document.createElement("p"); p.className = "muted"; p.textContent = text; parent.appendChild(p); }

async function load() {
  let data;
  try { data = await api("/me"); } catch {
    $("#auth").classList.remove("hidden"); $("#dash").classList.add("hidden"); $("#nav").classList.add("hidden");
    document.documentElement.removeAttribute("data-theme"); return;
  }
  $("#auth").classList.add("hidden"); $("#dash").classList.remove("hidden"); $("#nav").classList.remove("hidden");
  $("#viewLink").href = "/p/" + data.user.username;
  FIELDS.forEach((k) => { $("#" + k).value = data.portfolio[k] || ""; });
  document.documentElement.dataset.theme = data.portfolio.theme;

  const pl = $("#projectList"); pl.textContent = "";
  if (!data.projects.length) empty(pl, "No projects yet. Add your first one above.");
  data.projects.forEach((x) => listRow(pl, x.title, x.tech, async () => { await api("/me/projects/" + x.id, "DELETE"); load(); }));
  const sl = $("#skillList"); sl.textContent = "";
  if (!data.skills.length) empty(sl, "No skills yet. Add your first one above.");
  data.skills.forEach((x) => listRow(sl, x.name, "Level " + x.level + " of 5", async () => { await api("/me/skills/" + x.id, "DELETE"); load(); }));
}

$("#registerForm").onsubmit = guard(async () => {
  await api("/auth/register", "POST", { username: $("#rUser").value, email: $("#rEmail").value, password: $("#rPass").value });
  await load(); msg("Account created. Fill in your details below.", true);
});
$("#loginForm").onsubmit = guard(async () => {
  await api("/auth/login", "POST", { email: $("#lEmail").value, password: $("#lPass").value }); await load();
});
$("#logout").onclick = async () => { await api("/auth/logout", "POST"); clearMsg(); load(); };
$("#profileForm").onsubmit = guard(async () => {
  const b = {}; FIELDS.forEach((k) => { b[k] = $("#" + k).value; });
  await api("/me/portfolio", "PUT", b); document.documentElement.dataset.theme = b.theme; msg("Details saved.", true);
});
$("#projectForm").onsubmit = guard(async () => {
  await api("/me/projects", "POST", { title: $("#ptitle").value, description: $("#pdesc").value, tech: $("#ptech").value, link: $("#plink").value });
  $("#projectForm").reset(); await load(); msg("Project added.", true);
});
$("#skillForm").onsubmit = guard(async () => {
  await api("/me/skills", "POST", { name: $("#sname").value, level: $("#slevel").value });
  $("#skillForm").reset(); await load(); msg("Skill added.", true);
});
load();
