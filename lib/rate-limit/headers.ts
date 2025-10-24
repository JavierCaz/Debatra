import type { NextResponse } from "next/server";
import type { RateLimiterRes } from "rate-limiter-flexible";

export function addRateLimitHeaders(
  response: NextResponse,
  rateLimitResult: RateLimiterRes,
  maxPoints: number,
): NextResponse {
  response.headers.set("X-RateLimit-Limit", maxPoints.toString());
  response.headers.set(
    "X-RateLimit-Remaining",
    rateLimitResult.remainingPoints.toString(),
  );
  response.headers.set(
    "X-RateLimit-Reset",
    new Date(Date.now() + rateLimitResult.msBeforeNext).toISOString(),
  );

  return response;
}
