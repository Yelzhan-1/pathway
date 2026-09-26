import { isGatewayAuthOrCreditError, logAgentError } from "@/lib/agent/errors";

export const ESSAY_UNAVAILABLE_RU = "Разбор письма временно недоступен. Попробуй ещё раз.";
export const ESSAY_GENERIC_ERROR_RU = "Не получилось разобрать письмо. Попробуй ещё раз позже.";

/** Reuses the agent's gateway auth/credit detection — same Gateway, same failure modes. */
export function essayErrorText(error: unknown): string {
  return isGatewayAuthOrCreditError(error) ? ESSAY_UNAVAILABLE_RU : ESSAY_GENERIC_ERROR_RU;
}

export function logEssayError(error: unknown): void {
  logAgentError(error);
}
