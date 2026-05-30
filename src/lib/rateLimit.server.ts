/**
 * Server-only Sliding Window Rate Limiter
 * Tracks and limits requests in memory per user to avoid abuse or API cost spikes.
 */

// Memory store: Map<userId, Array of timestamps in ms>
const requestStore = new Map<string, number[]>();

const WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS = 5; // Max 5 requests per minute

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

/**
 * Checks if a user has exceeded their request limit
 */
export function checkRateLimit(userId: string): RateLimitResult {
  const now = Date.now();

  // Clean up store for garbage collection occasionally
  if (Math.random() < 0.05) {
    for (const [key, timestamps] of requestStore.entries()) {
      const filtered = timestamps.filter((time) => now - time < WINDOW_MS);
      if (filtered.length === 0) {
        requestStore.delete(key);
      } else {
        requestStore.set(key, filtered);
      }
    }
  }

  // Get timestamps for this user
  let timestamps = requestStore.get(userId) || [];

  // Filter timestamps within the current window
  timestamps = timestamps.filter((time) => now - time < WINDOW_MS);

  if (timestamps.length < MAX_REQUESTS) {
    // Record this request
    timestamps.push(now);
    requestStore.set(userId, timestamps);

    return {
      allowed: true,
      remaining: MAX_REQUESTS - timestamps.length,
      resetSeconds: 0,
    };
  }

  // Limit reached
  const oldestTimestamp = timestamps[0];
  const elapsedSinceOldest = now - oldestTimestamp;
  const resetMs = WINDOW_MS - elapsedSinceOldest;
  const resetSeconds = Math.max(1, Math.ceil(resetMs / 1000));

  return {
    allowed: false,
    remaining: 0,
    resetSeconds,
  };
}
