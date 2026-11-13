#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { assess, InputError, parseInput } from "./assess.js";
import { assessmentMarkdown } from "./report.js";

const USAGE = `insurance-readiness

  insurance-readiness check <answers.json> [--json]

Exit codes: 0 ready, 1 at risk or likely decline, 2 bad input.`;

function main(argv: string[]): number {
  const [cmd, file] = argv;
  if (cmd !== "check" || !file) { console.error(USAGE); return 2; }
  try {
    const a = assess(parseInput(readFileSync(file, "utf8")));
    process.stdout.write(argv.includes("--json") ? JSON.stringify(a, null, 2) + "\n" : assessmentMarkdown(a));
    return a.eligibility === "ready" ? 0 : 1;
  } catch (e) {
    if (e instanceof InputError || (e as NodeJS.ErrnoException).code === "ENOENT") { console.error(`error: ${(e as Error).message}`); return 2; }
    throw e;
  }
}

process.exitCode = main(process.argv.slice(2));
