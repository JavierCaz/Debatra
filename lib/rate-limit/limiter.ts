import { RateLimiterMemory, type RateLimiterRes } from "rate-limiter-flexible";

const rateLimiters = {
  auth: new RateLimiterMemory({
    points: 5, // 5 attempts
    duration: 60 * 15, // per 15 minutes
    blockDuration: 60 * 15, // Block for 15 minutes
  }),

  passwordReset: new RateLimiterMemory({
    points: 3, // 3 attempts
    duration: 60 * 60, // per hour
    blockDuration: 60 * 60, // Block for 1 hour
  }),

  registration: new RateLimiterMemory({
    points: 3, // 3 attempts
    duration: 60 * 60, // per hour
    blockDuration: 60 * 60 * 24, // Block for 24 hours
  }),

  api: new RateLimiterMemory({
    points: 100, // 100 requests
    duration: 60 * 15, // per 15 minutes
    blockDuration: 60 * 5, // Block for 5 minutes
  }),

  email: new RateLimiterMemory({
    points: 5, // 5 emails
    duration: 60 * 60, // per hour
    blockDuration: 60 * 60 * 2, // Block for 2 hours
  }),
};

export type RateLimiterType = keyof typeof rateLimiters;

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

export async function resetRateLimit(
  identifier: string,
  type: RateLimiterType = "api",
) {
  const limiter = rateLimiters[type];
  await limiter.delete(identifier);
}
