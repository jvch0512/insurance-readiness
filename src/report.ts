import { Assessment } from "./assess.js";

const LABEL = { ready: "Ready to quote", "at-risk": "At risk: answers need evidence or correction", "likely-decline": "Likely decline or restrictive terms: a gate control is missing" } as const;

export function assessmentMarkdown(a: Assessment): string {
  const L: string[] = [`# Cyber insurance readiness: ${a.organisation}`, "", `Eligibility: **${LABEL[a.eligibility]}**`, `Rating pressure: ${a.pressure}/100 (relative, higher means more upward pressure on price and conditions; not a premium estimate)`, ""];
  L.push("## Controls", "", "| Control | Tier | State | Why |", "|---|---|---|---|");
  for (const r of a.results) L.push(`| ${r.control.title} | ${r.control.tier} | ${r.state} | ${r.reasons.join(" ") || "-"} |`);
  if (a.misstatement.length) {
    L.push("", "## Misstatement risk", "", "A yes that your own data does not support can void cover at claim time. Correct the answer or attach evidence before signing:", "");
    for (const r of a.misstatement) L.push(`- ${r.control.title}: ${r.reasons.join(" ")}`);
  }
  if (a.actions.length) {
    L.push("", "## Do next (gates first, then weight against effort)", "", "| # | Action | Why now | Effort |", "|---|---|---|---|");
    a.actions.slice(0, 10).forEach((x, i) => L.push(`| ${i + 1} | ${x.control.title} | ${x.control.tier === "gate" ? "gate control" : "rating control"}, state ${x.state} | ${x.control.effort} |`));
  }
  L.push("", "Controls follow market underwriting practice in 2026 and are not any single insurer's form. Always answer the insurer's own questionnaire exactly; this tool helps you check the answers against your evidence first. Not insurance or legal advice.");
  return L.join("\n") + "\n";
}
