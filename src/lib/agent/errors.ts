export const AGENT_UNAVAILABLE_RU = "Ассистент временно недоступен";
export const AGENT_GENERIC_ERROR_RU = "Помощник сейчас недоступен. Попробуй позже.";

function errorBlob(error: unknown): { name: string; message: string; status: number | null } {
  const record = error && typeof error === "object" ? (error as Record<string, unknown>) : null;
  const name = record && typeof record.name === "string" ? record.name : "";
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const nested =
    record && record.cause && typeof record.cause === "object"
      ? (record.cause as Record<string, unknown>)
      : null;
  const statusRaw = record?.statusCode ?? record?.status ?? nested?.statusCode ?? nested?.status;
  const status = typeof statusRaw === "number" && Number.isFinite(statusRaw) ? statusRaw : null;
  return { name, message, status };
}

export function isGatewayAuthOrCreditError(error: unknown): boolean {
  const { name, message, status } = errorBlob(error);
  if (name === "LoadAPIKeyError") return true;
  if (status === 401 || status === 402 || status === 403) return true;
  const blob = `${name} ${message}`.toLowerCase();
  return /api key|unauthorized|forbidden|credit|quota|insufficient|payment required|ai_gateway|\bgateway\b/.test(
    blob,
  );
}

export function agentErrorText(error: unknown): string {
  return isGatewayAuthOrCreditError(error) ? AGENT_UNAVAILABLE_RU : AGENT_GENERIC_ERROR_RU;
}
