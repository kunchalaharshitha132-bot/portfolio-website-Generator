const root = document.getElementById("root");
function el(tag, text, cls) { const e = document.createElement(tag); if (text) e.textContent = text; if (cls) e.className = cls; return e; }
function link(text, href) { const a = el("a", text); if (/^(https?:\/\/|mailto:)/i.test(href)) { a.href = href; a.target = "_blank"; a.rel = "noopener"; } return a; }

(async () => {
  const username = location.pathname.split("/")[2];
  const res = await fetch("/api/public/" + encodeURIComponent(username));
  const data = await res.json();
  root.textContent = "";
  if (!res.ok) { root.append(el("h2", "Portfolio not found"), el("p", "Check the link and try again.", "muted")); return; }
  const { portfolio: p, projects, skills } = data;
  document.documentElement.dataset.theme = p.theme;
  document.title = p.full_name + " - Portfolio";

  const hero = el("section", null, "hero");
  hero.append(el("h2", p.full_name), el("p", p.headline, "muted"), el("p", p.bio));
  const contact = el("p");
  if (p.public_email) contact.append(link(p.public_email, "mailto:" + p.public_email), " ");
  if (p.github) contact.append(link("GitHub", p.github), " ");
  if (p.linkedin) contact.append(link("LinkedIn", p.linkedin));
  hero.append(contact); root.append(hero);

  if (skills.length) {
    const c = el("section", null, "card"); c.append(el("h3", "Skills"));
    skills.forEach((s) => c.append(el("span", s.name + " (" + s.level + "/5)", "tag")));
    root.append(c);
  }
  const pc = el("section"); pc.append(el("h3", "Projects"));
  if (!projects.length) pc.append(el("p", "No projects added yet.", "muted"));
  projects.forEach((x) => {
    const c = el("article", null, "card"); c.append(el("h3", x.title));
    if (x.description) c.append(el("p", x.description));
    if (x.tech) c.append(el("p", x.tech, "muted"));
    if (x.link) c.append(link("View project", x.link));
    pc.append(c);
  });
  root.append(pc);
})();
