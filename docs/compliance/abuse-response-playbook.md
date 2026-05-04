# Abuse response playbook (internal)

Operational outline for **intermediary-style** diligence: timely response, proportionate enforcement, evidence preservation, and legal escalation. Targets align with common **24–72 hour** acknowledgement expectations for non-emergency abuse; **same-day** for highest severity.

## 1. Roles

| Role | Responsibility |
| ---- | -------------- |
| **On-call triage** | First read of `/legal/report-content` inbox and in-app flags; severity tagging. |
| **Admin / product** | Account suspension, content takedown in DB + object storage, user communication. |
| **Legal / compliance** | Law-enforcement (LE) requests, preservation orders, regulatory correspondence. |

*Assign named individuals and backups in your internal roster (not in this repo).*

## 2. Severity rubric

| Tier | Indicators | Initial actions |
| ---- | ---------- | --------------- |
| **S0 — emergency** | CSAM, credible imminent violence, active coordinated harm | **Do not download** suspected CSAM media unnecessarily; isolate URLs/IDs; **escalate legal immediately**; preserve metadata per counsel; suspend account. |
| **S1 — high** | Non-consensual intimate imagery (NCII), malicious deepfake targeting a person | Takedown **as soon as verified**; suspend pending investigation; preserve logs; notify reporter if safe. |
| **S2 — medium** | Harassment campaigns, IP violations with court order potential, repeat policy breaches | Warning or suspension; scoped takedown; document timeline. |
| **S3 — low** | Spam, borderline tone, single-offense misunderstandings | Warning; education; monitor. |

## 3. SLA (targets)

- **S0:** Immediate handoff to legal; no SLA for unilateral product decision beyond containment.  
- **S1 / S2:** **Acknowledge** reporter within **24–72 hours**; substantive update within **5 business days** unless complex.  
- **S3:** **Within 72 hours** acknowledgement.

## 4. Suspension criteria (examples)

- Confirmed **S0** or **S1** violation.  
- **Evasion** after enforcement (new account, same behavior).  
- **Repeated S2** within a rolling window (define internally, e.g. 3 strikes in 90 days).

## 5. Evidence preservation

1. **Database:** export or snapshot `users`, `posts`, `post_versions`, `generation_jobs` / slot rows relevant to the incident (IDs, timestamps, `generation_prompt` JSON if present).  
2. **Object storage:** note GCS paths / URLs; **do not delete** until legal clears (or statutory period).  
3. **Application logs:** capture correlation IDs / time window from your log platform; avoid copying full prompts into tickets if policy is minimization — link to secured storage.  
4. **Chain of custody:** who accessed what, when (ticket notes).

## 6. Law enforcement (LE)

- **Single point of contact:** publish `legal@brandvertise.ai` (placeholder — replace).  
- **Verify** authority and jurisdiction; legal reviews subpoenas / preservation orders.  
- **Transparency reporting:** optional annual summary of requests received and complied with.

## 7. User communication templates

Maintain short, neutral templates for: (a) report received, (b) content removed, (c) account suspended, (d) insufficient information — **outside this repo** to avoid stale legal text.

## 8. Post-incident

- **Retro** for S0/S1: tune `contentSafety.js` patterns, prompt rules, or UX copy if gaps found.  
- **Metrics:** count of policy-blocked generations (`provider: policy-blocked`), provider safety refusals, reports by category.
