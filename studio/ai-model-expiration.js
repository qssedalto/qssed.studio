/**
 * Provider/model end-of-availability policy for AERTEX Intelligence.
 *
 * OpenAI dates: official API shutdowns (UTC).
 * Bailian dates: user's Model Studio *free-token quota* expiration, NOT a
 * shutdown of the underlying model. The owner explicitly requests these
 * choices to disappear before continued usage can incur pay-as-you-go charges.
 * Screenshots on 2026-11-16 show Beijing free quotas expiring 2026-12-24
 * and qwen4-max expiring 2027-02-14. Stop at the start of each Beijing
 * expiry date; the precise time-of-day is not supplied by the dashboard.
 *
 * Run this on EACH request. No cron job, client clock, or manual DB edit on
 * the future date is required. Unknown models are left untouched.
 */
export const AI_MODEL_EXPIRATION = Object.freeze({
  openai: Object.freeze({
    "gpt-4.1-nano": "2026-10-23T00:00:00Z",
    "gpt-4.1-nano-2025-04-14": "2026-10-23T00:00:00Z",
    "gpt-5-mini": "2026-12-11T00:00:00Z",
    "gpt-5-mini-2025-08-07": "2026-12-11T00:00:00Z",
    "gpt-5-nano": "2026-12-11T00:00:00Z",
    "gpt-5-nano-2025-08-07": "2026-12-11T00:00:00Z",
    "gpt-4o-mini": "2027-01-14T00:00:00Z",
    "gpt-4o-mini-2024-07-18": "2027-01-14T00:00:00Z"
  }),
  bailian: Object.freeze({
    "qwen3.5-122b-a10b": "2026-12-23T16:00:00Z",
    "qwen-vl-ocr-2025-11-20": "2026-12-23T16:00:00Z",
    "qwen3.7-plus": "2026-12-23T16:00:00Z",
    "tongyi-intent-detect-v3": "2026-12-23T16:00:00Z",
    "qwen3.5-plus-2026-02-15": "2026-12-23T16:00:00Z",
    "qwen-max": "2026-12-23T16:00:00Z",
    "glm-5": "2026-12-23T16:00:00Z",
    "qwen-mt-flash": "2026-12-23T16:00:00Z",
    "glm-5.1": "2026-12-23T16:00:00Z",
    "qwen4-max": "2027-02-13T16:00:00Z"
  })
});

/** The function remains pure for deterministic regression tests. */
export function isAiModelSelectable(provider, model, at = Date.now()) {
  const date = AI_MODEL_EXPIRATION[String(provider || "").toLowerCase()]?.[String(model || "")];
  return !date || Number(at) < Date.parse(date);
}

export function filterSelectableAiModels(provider, allowedModels, at = Date.now()) {
  return (Array.isArray(allowedModels) ? allowedModels : []).filter(
    model => isAiModelSelectable(provider, model, at)
  );
}
