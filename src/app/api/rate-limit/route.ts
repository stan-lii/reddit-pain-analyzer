import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { RateLimitResponse } from '@/lib/types';

const RATE_LIMIT_MAX = 5;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  return ip;
}

export async function GET(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const key = `rate_limit:${clientIp}`;

    const current = await kv.get<number>(key);
    const ttl = await kv.ttl(key);

    if (current === null) {
      // No rate limit data - user hasn't made any requests yet
      const response: RateLimitResponse = {
        remaining: RATE_LIMIT_MAX,
        resetTime: 0,
        limited: false,
      };
      return NextResponse.json(response);
    }

    const remaining = Math.max(0, RATE_LIMIT_MAX - current);
    const limited = current >= RATE_LIMIT_MAX;
    const resetTime = limited ? Date.now() + (ttl * 1000) : 0;

    const response: RateLimitResponse = {
      remaining,
      resetTime,
      limited,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Rate limit check error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}