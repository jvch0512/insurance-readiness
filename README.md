# insurance-readiness

Check your cyber insurance questionnaire answers against your evidence before you sign. It flags the gate controls that decide whether you get a quote, the "yes" answers your own data contradicts or cannot support, and the controls that push price and conditions up. Zero runtime dependencies. CLI and browser tool.

Live demo: https://jvch0512.github.io/insurance-readiness/ (runs in the tab, nothing is uploaded)

## Why

Insurers increasingly verify what you attest. The costly failure is not a "no", it is a "yes" that your own records do not back: coverage at 82% answered as 100%, an exception list nobody mentioned, a restore test from last year. Claims are contested on exactly that gap. This tool tests each answer against the numbers and evidence you hold, so you correct it before the broker does it for you.

## Quick start

```bash
npm install
npm test
node dist/src/cli.js check examples/renewal-draft.json   # exit 1: at risk
node dist/src/cli.js check examples/ready.json           # exit 0
npm start                                                # UI on http://127.0.0.1:8787
```

## How an answer is judged

| State | Meaning |
|---|---|
| supported | yes, with fresh evidence, no exceptions, numbers meet the bar |
| contradicted | yes, but coverage, patching days or an exception list say otherwise |
| unsupported | yes, with no evidence attached |
| stale | yes, but the test or the evidence is older than 12 months |
| partial, gap, unknown | partly in place, not in place, or not answered (insurers read unknown as no) |

Answer values mean "is this control in place". Controls are split into gates (MFA on e-mail, remote and privileged access, EDR or MDR at 95% coverage, immutable backups, a restore test in the last 12 months) and rating controls (exercised IR plan, patching in 14 days, no exposed EOL systems, RDP and SMB blocked, DMARC enforced, PAM, segmentation, 24x7 monitoring, training, payment call-back, vendor risk, encryption).

Eligibility is `ready`, `at-risk` (a gate is partial, contradicted, unsupported or stale) or `likely-decline` (a gate is missing). Rating pressure is a relative 0 to 100 score from the weights of rating controls, not a premium estimate.

## Limits

The control list reflects market underwriting practice as described in 2026 broker and MSP guidance, not any single insurer's form or rules; thresholds are common baselines. Always answer your insurer's own questionnaire exactly. Not insurance or legal advice.

## License

MIT
