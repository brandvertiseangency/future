# Reporting and contact (draft)

## In-product reporting

- **URL (customer-facing):** `/legal/report-content`  
- **Settings:** Profile area includes links to **Acceptable Use** and **Report content** for logged-in users.

## Report channel (configure before launch)

| Channel | Placeholder | Notes |
| ------- | ----------- | ----- |
| Email | `compliance@brandvertise.ai` | Replace with a monitored mailbox; publish on `/legal/report-content`. |
| Abuse / legal escalation | `legal@brandvertise.ai` | Law-enforcement and preservation requests (see [abuse-response-playbook.md](./abuse-response-playbook.md)). |

## SLA (internal target)

| Severity | Examples | Target |
| -------- | -------- | ------ |
| P0 | Suspected NCII, CSAM, credible violence threat | Same-day triage; preserve logs; escalate legal. |
| P1 | Deepfake / impersonation with harm, hate/harassment campaigns | **Within 24–72 hours** acknowledgement; content review and action. |
| P2 | IP disputes, general policy questions | **Within 72 hours** acknowledgement. |

## What to include in a report

- Link or post ID (if applicable), approximate time (UTC), description of the issue, and whether the reporter is the affected party or an agent.

## Product acknowledgement

First-run / versioned acceptance is stored in Postgres:

- `users.content_policy_version` — string matching the in-app **policy version** (e.g. `2026-05-05-v1`).  
- `users.content_policy_accepted_at` — timestamp when the user accepted.

Updates that require re-acceptance bump the version in `frontend/src/lib/content-policy.ts` (and optionally mirror in release notes).
