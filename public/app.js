import { assess, parseInput } from "/lib/assess.js";
import { assessmentMarkdown } from "/lib/report.js";

const $ = (id) => document.getElementById(id);
function el(tag, text, cls) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; }
function table(headers, rows, classes = []) {
  const t = document.createElement("table");
  const h = document.createElement("tr");
  headers.forEach((x) => h.append(el("th", x)));
  t.append(h);
  rows.forEach((r) => { const tr = document.createElement("tr"); r.forEach((c, i) => tr.append(el("td", String(c), classes[i] ? classes[i](c) : undefined))); t.append(tr); });
  return t;
}
function cards(items) {
  const box = el("div", undefined, "cards");
  for (const [label, value, cls] of items) { const c = el("div", undefined, `card ${cls ?? ""}`); c.append(el("b", String(value)), el("span", label)); box.append(c); }
  return box;
}
function panel(title, ...kids) { const p = el("div", undefined, "panel"); p.append(el("h2", title), ...kids); return p; }
function copyButton(getMd) {
  const b = el("button", "Copy markdown");
  b.type = "button";
  b.addEventListener("click", async () => { try { await navigator.clipboard.writeText(getMd()); b.textContent = "Copied"; setTimeout(() => { b.textContent = "Copy markdown"; }, 1500); } catch { /* clipboard blocked */ } });
  return b;
}
function downloadButton(getMd, name) {
  const b = el("button", "Download .md");
  b.type = "button";
  b.addEventListener("click", () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([getMd()], { type: "text/markdown" })); a.download = name; a.click(); URL.revokeObjectURL(a.href); });
  return b;
}
async function sample(name) { return (await fetch(`/examples/${name}`)).text(); }
function showError(box, e) { box.replaceChildren(el("p", String(e.message ?? e), "err")); }
function setupTabs() {
  document.querySelectorAll("#tabs button").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll("#tabs button").forEach((x) => x.classList.toggle("on", x === b));
    document.querySelectorAll(".tab").forEach((s) => { s.hidden = s.id !== `p-${b.dataset.tab}`; });
  }));
}
const cls = (map) => (v) => map[v] ?? "";


const ELIG = { ready: ["Ready to quote", "ok"], "at-risk": ["At risk", "warn"], "likely-decline": ["Likely decline", "bad"] };

function run() {
  const out = $("out");
  out.replaceChildren();
  const t = $("input").value.trim();
  if (!t) return;
  try {
    const a = assess(parseInput(t));
    const md = assessmentMarkdown(a);
    const [label, kind] = ELIG[a.eligibility];
    out.append(cards([["Eligibility", label, kind], ["Gates blocking", a.gatesBlocking.length, a.gatesBlocking.length ? "bad" : "ok"], ["Answers at risk", a.misstatement.length, a.misstatement.length ? "warn" : "ok"], ["Rating pressure", `${a.pressure}/100`, a.pressure > 40 ? "warn" : "ok"]]));
    out.append(panel("Controls", table(["Control", "Tier", "State", "Why"], a.results.map((r) => [r.control.title, r.control.tier, r.state, r.reasons.join(" ") || "-"]), [null, null, cls({ supported: "s-low", partial: "s-medium", stale: "s-medium", unsupported: "s-medium", contradicted: "s-high", gap: "s-high", unknown: "s-high" })])));
    if (a.misstatement.length) out.append(panel("Misstatement risk: fix before signing", ...a.misstatement.map((r) => el("p", `${r.control.title}: ${r.reasons.join(" ")}`))));
    if (a.actions.length) out.append(panel("Do next", table(["#", "Action", "Why now", "Effort"], a.actions.slice(0, 10).map((x, i) => [i + 1, x.control.title, `${x.control.tier}, ${x.state}`, x.control.effort]))));
    const row = el("div", undefined, "row");
    row.append(copyButton(() => md), downloadButton(() => md, "insurance-readiness.md"));
    out.append(row);
  } catch (e) { showError(out, e); }
}

for (const b of document.querySelectorAll("[data-sample]")) b.addEventListener("click", async () => { $("input").value = await sample(b.dataset.sample); run(); });
$("input").addEventListener("input", run);
