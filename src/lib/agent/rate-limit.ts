export const AGENT_HOURLY_USER_MESSAGE_LIMIT = 30;

export const AGENT_RATE_LIMIT_MESSAGE_RU =
  "Слишком много сообщений. Можно отправить не больше 30 в час.";

export function isOverAgentRateLimit(
  userMessagesInLastHour: number,
  limit = AGENT_HOURLY_USER_MESSAGE_LIMIT,
): boolean {
  return userMessagesInLastHour >= limit;
}
