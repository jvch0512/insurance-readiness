import { CONTROLS, Control } from "./controls.js";

export class InputError extends Error {}

export interface Evidence { type: string; date: string; ref: string }
export interface Answer { value: "yes" | "partial" | "no" | "unknown"; coverage: number | null; days: number | null; lastTested: string | null; exceptions: string[]; evidence: Evidence[] }
export interface Input { organisation: string; today: string; answers: Record<string, Answer> }
export type State = "supported" | "partial" | "contradicted" | "unsupported" | "stale" | "gap" | "unknown";
export interface ControlResult { control: Control; state: State; reasons: string[] }
export interface Assessment {
  organisation: string; results: ControlResult[];
  eligibility: "ready" | "at-risk" | "likely-decline";
  gatesBlocking: ControlResult[]; gatesAtRisk: ControlResult[]; misstatement: ControlResult[];
  pressure: number; actions: { control: Control; state: State; priority: number }[];
}

const DAY = 86400000;
const parse = (s: string, w: string): number => { if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(s))) throw new InputError(`${w} must be YYYY-MM-DD`); return Date.parse(s); };

export function parseInput(text: string): Input {
  let j: unknown;
  try { j = JSON.parse(text); } catch { throw new InputError("input is not valid JSON"); }
  if (typeof j !== "object" || j === null || Array.isArray(j)) throw new InputError("input must be an object");
  const o = j as Record<string, unknown>;
  const today = typeof o["today"] === "string" ? o["today"] : new Date().toISOString().slice(0, 10);
  parse(today, "today");
  const raw = o["answers"];
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) throw new InputError("answers must be an object keyed by control id");
  const known = new Set(CONTROLS.map((c) => c.id));
  const answers: Record<string, Answer> = {};
  for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!known.has(id)) throw new InputError(`unknown control id "${id}" (known: ${[...known].join(", ")})`);
    if (typeof v !== "object" || v === null) throw new InputError(`answers.${id} must be an object`);
    const a = v as Record<string, unknown>;
    if (!["yes", "partial", "no", "unknown"].includes(a["value"] as string)) throw new InputError(`answers.${id}.value must be yes, partial, no or unknown`);
    const ev = Array.isArray(a["evidence"]) ? a["evidence"] : [];
    const lt = typeof a["lastTested"] === "string" ? a["lastTested"] : null;
    if (lt) parse(lt, `answers.${id}.lastTested`);
    answers[id] = {
      value: a["value"] as Answer["value"],
      coverage: typeof a["coverage"] === "number" ? a["coverage"] : null,
      days: typeof a["days"] === "number" ? a["days"] : null,
      lastTested: lt,
      exceptions: Array.isArray(a["exceptions"]) ? a["exceptions"].map(String) : [],
      evidence: ev.map((e, i) => { const x = e as Record<string, unknown>; const d = String(x["date"] ?? ""); parse(d, `answers.${id}.evidence[${i}].date`); return { type: String(x["type"] ?? "document"), date: d, ref: String(x["ref"] ?? "") }; }),
    };
  }
  return { organisation: typeof o["organisation"] === "string" ? o["organisation"] : "(unnamed)", today, answers };
}

export function judge(c: Control, a: Answer | undefined, today: string): ControlResult {
  const t = parse(today, "today");
  const reasons: string[] = [];
  if (!a || a.value === "unknown") return { control: c, state: "unknown", reasons: ["No answer: an insurer will treat this as a no until you can state it."] };
  if (a.value === "no") return { control: c, state: "gap", reasons: ["Not in place."] };
  if (a.value === "partial") return { control: c, state: "partial", reasons: a.exceptions.length ? [`Exceptions: ${a.exceptions.join("; ")}`] : ["Partly in place."] };
  // value is yes: look for anything that contradicts it
  if (c.threshold !== undefined && a.coverage !== null && a.coverage < c.threshold) reasons.push(`Answer is yes but coverage is ${a.coverage}%, below ${c.threshold}%.`);
  if (c.maxDays !== undefined && a.days !== null && a.days > c.maxDays) reasons.push(`Answer is yes but median time to patch is ${a.days} days, above ${c.maxDays}.`);
  if (a.exceptions.length) reasons.push(`Answer is yes but exceptions exist: ${a.exceptions.join("; ")}.`);
  if (reasons.length) return { control: c, state: "contradicted", reasons };
  if (c.testedWithinDays !== undefined) {
    if (!a.lastTested) reasons.push("No date of the last test or exercise.");
    else if ((t - parse(a.lastTested, "lastTested")) / DAY > c.testedWithinDays) reasons.push(`Last test ${a.lastTested} is older than ${c.testedWithinDays} days.`);
    if (reasons.length) return { control: c, state: "stale", reasons };
  }
  if (a.evidence.length === 0) return { control: c, state: "unsupported", reasons: [`Yes without evidence. Attach: ${c.evidence}.`] };
  if (a.evidence.every((e) => (t - parse(e.date, "evidence.date")) / DAY > 365)) return { control: c, state: "stale", reasons: ["All evidence is older than 12 months."] };
  return { control: c, state: "supported", reasons: [] };
}

const FULL: State[] = ["gap", "unknown"];
export function assess(i: Input): Assessment {
  const results = CONTROLS.map((c) => judge(c, i.answers[c.id], i.today));
  const gates = results.filter((r) => r.control.tier === "gate");
  const gatesBlocking = gates.filter((r) => FULL.includes(r.state));
  const gatesAtRisk = gates.filter((r) => ["partial", "contradicted", "unsupported", "stale"].includes(r.state));
  const misstatement = results.filter((r) => ["contradicted", "unsupported"].includes(r.state));
  const rating = results.filter((r) => r.control.tier === "rating");
  const total = rating.reduce((n, r) => n + r.control.weight, 0);
  const lost = rating.reduce((n, r) => n + (r.state === "supported" ? 0 : FULL.includes(r.state) ? r.control.weight : r.control.weight / 2), 0);
  const eff = { low: 1, medium: 2, high: 3 } as const;
  const actions = results.filter((r) => r.state !== "supported").map((r) => ({ control: r.control, state: r.state, priority: (r.control.tier === "gate" ? 100 : 0) + (FULL.includes(r.state) ? 20 : 10) + r.control.weight * 2 - eff[r.control.effort] * 3 })).sort((a, b) => b.priority - a.priority);
  return { organisation: i.organisation, results, eligibility: gatesBlocking.length ? "likely-decline" : gatesAtRisk.length ? "at-risk" : "ready", gatesBlocking, gatesAtRisk, misstatement, pressure: Math.round((lost / total) * 100), actions };
}
