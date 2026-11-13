# Cyber insurance readiness: Industrias Ejemplo S.L.

Eligibility: **At risk: answers need evidence or correction**
Rating pressure: 55/100 (relative, higher means more upward pressure on price and conditions; not a premium estimate)

## Controls

| Control | Tier | State | Why |
|---|---|---|---|
| MFA on e-mail and cloud apps | gate | supported | - |
| MFA on all remote access (VPN, RDP gateway, VDI) | gate | contradicted | Answer is yes but exceptions exist: Legacy VPN group for two contractors without MFA. |
| MFA on privileged and admin accounts, including cloud consoles and backup consoles | gate | unsupported | Yes without evidence. Attach: Admin role list from the identity provider with MFA state. |
| EDR or MDR on endpoints and servers | gate | contradicted | Answer is yes but coverage is 82%, below 95%. |
| Immutable or offline backups | gate | supported | - |
| Restore tested in the last 12 months | gate | stale | Last test 2025-04-10 is older than 365 days. |
| Incident response plan, exercised in the last 12 months | rating | supported | - |
| Critical patches applied within 14 days | rating | contradicted | Answer is yes but median time to patch is 27 days, above 14. |
| End-of-life systems kept off the internet | rating | partial | Exceptions: Windows Server 2012 R2 file server behind VPN |
| RDP and SMB blocked from the internet | rating | gap | Not in place. |
| SPF, DKIM and DMARC enforced (p=quarantine or reject) | rating | supported | - |
| Privileged access management or tiered admin accounts | rating | gap | Not in place. |
| Network segmentation for critical systems | rating | unknown | No answer: an insurer will treat this as a no until you can state it. |
| 24x7 monitoring (SOC or MDR) | rating | unknown | No answer: an insurer will treat this as a no until you can state it. |
| Security awareness training and phishing simulations | rating | supported | - |
| Call-back or dual approval for payment and bank-detail changes | rating | unsupported | Yes without evidence. Attach: Finance procedure and a sample of approvals. |
| Vendor and MSP risk management | rating | partial | Partly in place. |
| Encryption of laptops and sensitive data at rest | rating | supported | - |

## Misstatement risk

A yes that your own data does not support can void cover at claim time. Correct the answer or attach evidence before signing:

- MFA on all remote access (VPN, RDP gateway, VDI): Answer is yes but exceptions exist: Legacy VPN group for two contractors without MFA.
- MFA on privileged and admin accounts, including cloud consoles and backup consoles: Yes without evidence. Attach: Admin role list from the identity provider with MFA state.
- EDR or MDR on endpoints and servers: Answer is yes but coverage is 82%, below 95%.
- Critical patches applied within 14 days: Answer is yes but median time to patch is 27 days, above 14.
- Call-back or dual approval for payment and bank-detail changes: Yes without evidence. Attach: Finance procedure and a sample of approvals.

## Do next (gates first, then weight against effort)

| # | Action | Why now | Effort |
|---|---|---|---|
| 1 | MFA on all remote access (VPN, RDP gateway, VDI) | gate control, state contradicted | low |
| 2 | MFA on privileged and admin accounts, including cloud consoles and backup consoles | gate control, state unsupported | low |
| 3 | EDR or MDR on endpoints and servers | gate control, state contradicted | medium |
| 4 | Restore tested in the last 12 months | gate control, state stale | medium |
| 5 | RDP and SMB blocked from the internet | rating control, state gap | low |
| 6 | Privileged access management or tiered admin accounts | rating control, state gap | high |
| 7 | 24x7 monitoring (SOC or MDR) | rating control, state unknown | high |
| 8 | Critical patches applied within 14 days | rating control, state contradicted | medium |
| 9 | Network segmentation for critical systems | rating control, state unknown | high |
| 10 | Call-back or dual approval for payment and bank-detail changes | rating control, state unsupported | low |

Controls follow market underwriting practice in 2026 and are not any single insurer's form. Always answer the insurer's own questionnaire exactly; this tool helps you check the answers against your evidence first. Not insurance or legal advice.
