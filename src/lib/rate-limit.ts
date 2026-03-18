import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function createLimiter(window: number, limit: number, prefix: string): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${window} s`),
    prefix,
  });
}

let _checkoutRateLimit: Ratelimit | null | undefined;
export function getCheckoutRateLimit() {
  if (_checkoutRateLimit === undefined) _checkoutRateLimit = createLimiter(60, 5, "ratelimit:checkout");
  return _checkoutRateLimit;
}

let _authRateLimit: Ratelimit | null | undefined;
export function getAuthRateLimit() {
  if (_authRateLimit === undefined) _authRateLimit = createLimiter(60, 10, "ratelimit:auth");
  return _authRateLimit;
}

let _newsletterRateLimit: Ratelimit | null | undefined;
export function getNewsletterRateLimit() {
  if (_newsletterRateLimit === undefined) _newsletterRateLimit = createLimiter(60, 3, "ratelimit:newsletter");
  return _newsletterRateLimit;
}

export async function rateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  if (!limiter) return { success: true, remaining: 999, reset: 0 };
  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}
