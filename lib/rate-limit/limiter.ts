import { RateLimiterMemory, type RateLimiterRes } from "rate-limiter-flexible";

// Different rate limiters for different endpoints
const rateLimiters = {
  // Authentication endpoints
  auth: new RateLimiterMemory({
    points: 5, // 5 attempts
    duration: 60 * 15, // per 15 minutes
    blockDuration: 60 * 15, // Block for 15 minutes
  }),

  // Password reset (stricter)
  passwordReset: new RateLimiterMemory({
    points: 3, // 3 attempts
    duration: 60 * 60, // per hour
    blockDuration: 60 * 60, // Block for 1 hour
  }),

  // Registration
  registration: new RateLimiterMemory({
    points: 3, // 3 attempts
    duration: 60 * 60, // per hour
    blockDuration: 60 * 60 * 24, // Block for 24 hours
  }),

  // API endpoints (general)
  api: new RateLimiterMemory({
    points: 100, // 100 requests
    duration: 60 * 15, // per 15 minutes
    blockDuration: 60 * 5, // Block for 5 minutes
  }),

  // Email sending
  email: new RateLimiterMemory({
    points: 5, // 5 emails
    duration: 60 * 60, // per hour
    blockDuration: 60 * 60 * 2, // Block for 2 hours
  }),
};

export type RateLimiterType = keyof typeof rateLimiters;

/**
 * Rate limit check
 * @param identifier - Usually IP address or user ID
 * @param type - Type of rate limiter to use
 * @returns true if allowed, throws error if rate limited
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimiterType = "api",
): Promise<RateLimiterRes> {
  const limiter = rateLimiters[type];

  try {
    const result = await limiter.consume(identifier);
    return result;
  } catch (rateLimiterRes) {
    console.warn(`Rate limit exceeded for ${identifier} on ${type} limiter.`);
    throw rateLimiterRes;
  }
}

/**
 * Get remaining points for an identifier
 */
export async function getRateLimitInfo(
  identifier: string,
  type: RateLimiterType = "api",
) {
  const limiter = rateLimiters[type];
  const res = await limiter.get(identifier);

  if (!res) {
    return {
      remaining: rateLimiters[type].points,
      resetTime: null,
    };
  }

  return {
    remaining: res.remainingPoints,
    resetTime: new Date(Date.now() + res.msBeforeNext),
  };
}

/**
 * Reset rate limit for an identifier (useful for admin actions)
 */
export async function resetRateLimit(
  identifier: string,
  type: RateLimiterType = "api",
) {
  const limiter = rateLimiters[type];
  await limiter.delete(identifier);
}
