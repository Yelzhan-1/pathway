/**
 * Rate limit for «Разбор мотивационного письма» (/essay): ~5 analyses per user per hour.
 *
 * This is an in-memory fallback — no letter text and no usage rows are persisted to the
 * database (see supabase/migrations/20260926190000_essay_usage.sql, written but NOT applied
 * per the standing DB-migration rule). Because it's in-memory, the counter resets on a cold
 * start and is not shared across serverless instances; it still caps runaway usage from a
 * single warm instance today, and can be swapped for a DB-backed count once that migration
 * is applied, without changing the call sites below.
 */

export const ESSAY_HOURLY_USER_LIMIT = 5;

export const ESSAY_RATE_LIMIT_MESSAGE_RU = `Слишком много разборов. Можно не больше ${ESSAY_HOURLY_USER_LIMIT} в час.`;

const ESSAY_WINDOW_MS = 60 * 60 * 1000;

export function isOverEssayRateLimit(recentCount: number, limit = ESSAY_HOURLY_USER_LIMIT): boolean {
  return recentCount >= limit;
}

export function createEssayRateLimiter(windowMs = ESSAY_WINDOW_MS) {
  const usageByUser = new Map<string, number[]>();

  return {
    /** Counts usage timestamps within the window for a user, pruning older entries in place. */
    recentCount(userId: string, now = Date.now()): number {
      const timestamps = usageByUser.get(userId);
      if (!timestamps) return 0;
      const cutoff = now - windowMs;
      const fresh = timestamps.filter((timestamp) => timestamp > cutoff);
      if (fresh.length !== timestamps.length) usageByUser.set(userId, fresh);
      return fresh.length;
    },
    /** Records one usage event. Call only after a successful analysis, so failed attempts don't count. */
    record(userId: string, now = Date.now()): void {
      const timestamps = usageByUser.get(userId) ?? [];
      timestamps.push(now);
      usageByUser.set(userId, timestamps);
    },
  };
}

/** Process-wide limiter used by the /api/essay route. */
export const essayRateLimiter = createEssayRateLimiter();
