# Risk matrix — generation entrypoints

Maps **where** synthetic images are produced, **what** flows into the model, **what** is stored, and **retention / redaction** considerations. Aligns with India intermediary diligence: traceability without unnecessary retention of raw prompts.

## Summary table

| Entrypoint | File(s) | Primary free-text / structured inputs | Image pipeline | Outputs persisted | Logs / observability | Retention / redaction |
| ---------- | ------- | --------------------------------------- | -------------- | ----------------- | -------------------- | --------------------- |
| On-demand creative | `src/routes/generateContent.js` | `brief`, `mood`, `theme`, `campaign`, AI-derived `imagePrompt`, enriched assembly | `generateImageDetailed` → GCS via `persistGeneratedImageToStorage` | `posts` row: `caption`, `hashtags`, `image_url`, `generation_prompt` JSON (brief, prompts, `imageProvider`, `imageModel`) | `logger` on AI/image failure; policy block in `src/lib/ai.js` | Define **TTL** for `generation_prompt` on approve/delete (see `purgePromptArtifactsForPost` usage on approve); avoid logging **full** prompts in production if minimization required — use **truncated preview** only. |
| Calendar slot generation | `src/routes/calendarPlan.js` (worker path) | `post_idea`, `caption_draft`, `creative_brief`, slot topic, brand fields, assembled `imagePrompt` + `artDirection` | `generateImageDetailed` | Same `posts` + `post_versions`; slot `generation_prompt` payload | Slot / job error logs | Same as posts; calendar edits that change briefs flow into next generation. |
| Post regenerate (feedback) | `src/routes/posts.js` `POST /:id/regenerate` | `feedback`, existing caption, AI `imagePrompt` | `generateImageDetailed` | Updates `posts`, inserts `post_versions` with `generation_prompt`, `feedback_note` | Warnings on AI regen failure | Policy block returns **400** before credit deduction when image path blocked. |
| Legacy / worker image service | `src/services/imageService.js` → `src/workers/generationWorker.js` | `buildPrompt` in `src/services/promptService.js` from post + brand + assets | `generateImage` → `generateImageDetailed` | Worker updates `posts.image_url`, Firestore mirror | `logger` in `imageService` | Same image + metadata rules as other paths. |

## Central controls

| Control | Location |
| ------- | -------- |
| Prompt hygiene (model instructions) | `src/services/promptService.js` — STRICT RULES (NSFW / violence / inappropriate). |
| **Hard block** (pattern gate before Google image APIs) | `src/lib/contentSafety.js` — invoked from `generateImageDetailed` in `src/lib/ai.js`. |
| User policy acknowledgement | `PATCH /api/users/me` with `accept_content_policy` + `content_policy_version`; UI modal in app shell. |

## Logging guidance

- **Do:** log `route`, `userId` / `brandId` (if available), `provider`, `model`, **policy decision** (`policy-blocked` vs provider error), **truncated** prompt preview (e.g. first 120 chars — already used in `ai.js`).  
- **Avoid:** full raw prompts in long-term central logs if minimization is a priority; rely on DB `generation_prompt` with a defined retention policy and redaction on account deletion where feasible.

## Open decisions (fill with legal / ops)

- Exact **retention period** for `posts.generation_prompt` and `post_versions.generation_prompt` after post delete or account closure.  
- Whether to **hash** prompts in logs instead of previews.  
- **Reference images:** consent workflow for user-uploaded photos of identifiable people (beyond brand-owned assets).
