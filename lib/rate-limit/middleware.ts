import { NextResponse } from 'next/server';
import { checkRateLimit, RateLimiterType } from './limiter';
import { RateLimiterRes } from 'rate-limiter-flexible';

/**
 * Get client identifier (IP address)
 */
export function getClientIdentifier(req: Request): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a generic identifier
  return 'unknown';
}

/**
 * Apply rate limiting to a request
 */
export async function applyRateLimit(
  req: Request,
  type: RateLimiterType = 'api'
): Promise<NextResponse | null> {
  const identifier = getClientIdentifier(req);

  try {
    const rateLimitResult: RateLimiterRes = await checkRateLimit(identifier, type);
    
    // Add rate limit headers to response
    return null; // No error, continue
  } catch (rateLimiterRes: any) {
    // Rate limit exceeded
    const retryAfter = Math.ceil(rateLimiterRes.msBeforeNext / 1000);
    
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `You have exceeded the rate limit. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': rateLimiterRes.consumedPoints.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString(),
        },
      }
    );
  }
}

/**
 * Rate limit wrapper for API routes
 */
export function withRateLimit(
  handler: (req: Request) => Promise<NextResponse>,
  type: RateLimiterType = 'api'
) {
  return async (req: Request) => {
    const rateLimitResponse = await applyRateLimit(req, type);
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    return handler(req);
  };
}