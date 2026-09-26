/**
 * Gateway model ids are `provider/model` strings (AI SDK 7).
 * `google/gemini-2.5-flash-lite` is a fast, cheap id added by @ai-sdk/gateway.
 * Override with AGENT_MODEL. Auth is AI_GATEWAY_API_KEY or Vercel OIDC.
 */
export const DEFAULT_AGENT_MODEL = "google/gemini-2.5-flash-lite";

export function agentModelId(): string {
  const configured = process.env.AGENT_MODEL?.trim();
  return configured || DEFAULT_AGENT_MODEL;
}
