import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { assess, InputError, judge, parseInput } from "../src/assess.js";
import { CONTROLS } from "../src/controls.js";
import { assessmentMarkdown } from "../src/report.js";

const load = (n: string) => parseInput(readFileSync(`examples/${n}`, "utf8"));
const c = (id: string) => CONTROLS.find((x) => x.id === id)!;
const ev = [{ type: "report", date: "2026-10-01", ref: "r" }];
const A = (o: object) => ({ value: "yes" as const, coverage: null, days: null, lastTested: null, exceptions: [], evidence: ev, ...o });

test("yes with fresh evidence is supported", () => {
  assert.equal(judge(c("mfa-email"), A({ coverage: 100 }), "2026-11-13").state, "supported");
});
test("yes without evidence is unsupported", () => {
  assert.equal(judge(c("mfa-email"), A({ evidence: [] }), "2026-11-13").state, "unsupported");
});
test("yes with coverage below threshold is contradicted", () => {
  const r = judge(c("edr"), A({ coverage: 82 }), "2026-11-13");
  assert.equal(r.state, "contradicted"); assert.match(r.reasons[0]!, /82%/);
});
test("coverage at the threshold passes", () => {
  assert.equal(judge(c("edr"), A({ coverage: 95 }), "2026-11-13").state, "supported");
});
test("yes with exceptions is contradicted", () => {
  assert.equal(judge(c("mfa-remote"), A({ exceptions: ["contractors"] }), "2026-11-13").state, "contradicted");
});
test("patching slower than the limit is contradicted", () => {
  assert.equal(judge(c("patching"), A({ days: 27 }), "2026-11-13").state, "contradicted");
  assert.equal(judge(c("patching"), A({ days: 14 }), "2026-11-13").state, "supported");
});
test("old restore test is stale, missing date is stale", () => {
  assert.equal(judge(c("backup-tested"), A({ lastTested: "2025-04-10" }), "2026-11-13").state, "stale");
  assert.equal(judge(c("backup-tested"), A({}), "2026-11-13").state, "stale");
  assert.equal(judge(c("backup-tested"), A({ lastTested: "2026-08-01" }), "2026-11-13").state, "supported");
});
test("all-old evidence is stale", () => {
  assert.equal(judge(c("mfa-email"), A({ evidence: [{ type: "r", date: "2025-01-01", ref: "" }] }), "2026-11-13").state, "stale");
});
test("no, partial and unknown map to states", () => {
  assert.equal(judge(c("pam"), { ...A({}), value: "no" }, "2026-11-13").state, "gap");
  assert.equal(judge(c("pam"), { ...A({}), value: "partial" }, "2026-11-13").state, "partial");
  assert.equal(judge(c("pam"), undefined, "2026-11-13").state, "unknown");
});
test("draft renewal is at risk, with misstatement risks and ordered actions", () => {
  const a = assess(load("renewal-draft.json"));
  assert.equal(a.eligibility, "at-risk");
  assert.ok(a.misstatement.length >= 4);
  assert.equal(a.actions[0]!.control.tier, "gate");
  assert.ok(a.pressure > 30 && a.pressure < 100);
});
test("a missing gate means likely decline", () => {
  const i = load("renewal-draft.json");
  i.answers["edr"] = { ...A({}), value: "no" };
  assert.equal(assess(i).eligibility, "likely-decline");
});
test("fully evidenced profile is ready with zero pressure", () => {
  const a = assess(load("ready.json"));
  assert.equal(a.eligibility, "ready"); assert.equal(a.pressure, 0); assert.equal(a.actions.length, 0);
});
test("input validation", () => {
  assert.throws(() => parseInput("{"), InputError);
  assert.throws(() => parseInput(JSON.stringify({ answers: { nope: { value: "yes" } } })), InputError);
  assert.throws(() => parseInput(JSON.stringify({ answers: { edr: { value: "maybe" } } })), InputError);
  assert.throws(() => parseInput(JSON.stringify({ today: "13/11/2026", answers: {} })), InputError);
});
test("report contains the sections", () => {
  const md = assessmentMarkdown(assess(load("renewal-draft.json")));
  assert.match(md, /Misstatement risk/); assert.match(md, /Do next/); assert.match(md, /not a premium estimate/);
});
