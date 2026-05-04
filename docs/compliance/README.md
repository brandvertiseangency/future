# Compliance documentation (India IT intermediary / synthetic media)

Internal materials supporting **Brandvertise** posture under India’s **IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021**, including expectations around **user-directed synthetic media**, **deepfakes**, and **non-consensual intimate imagery** (as highlighted in routine platform reminders).

| Document | Purpose |
| -------- | ------- |
| [acceptable-use-policy.md](./acceptable-use-policy.md) | Customer-facing **Acceptable Use Policy** draft (legal review). |
| [reporting-and-contact.md](./reporting-and-contact.md) | **Report content** channel, SLA summary, placeholders for contact emails. |
| [risk-matrix.md](./risk-matrix.md) | Maps generation **entrypoints** → inputs, outputs, logs, retention / redaction. |
| [abuse-response-playbook.md](./abuse-response-playbook.md) | Abuse triage, suspension criteria, evidence preservation, law-enforcement escalation. |

**Engineering:** server-side prompt gate lives in `src/lib/contentSafety.js`, enforced inside `generateImageDetailed` in `src/lib/ai.js` (all image callers). Policy acknowledgement fields: `users.content_policy_version`, `users.content_policy_accepted_at` (see `src/db/migrate-additive.js`).
