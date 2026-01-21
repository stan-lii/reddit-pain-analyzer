import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { searchMultipleKeywords } from '@/lib/serpapi';

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 30 * 60; // 30 minutes in seconds

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const key = `rate_limit:${ip}`;
  const current = await kv.get<number>(key);

  if (current === null) {
    // First request - set TTL to 30 minutes
    await kv.set(key, 1, { ex: RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetTime: Date.now() + RATE_LIMIT_WINDOW * 1000 };
  }

  if (current >= RATE_LIMIT_MAX) {
    // Rate limit exceeded
    const ttl = await kv.ttl(key);
    const resetTime = Date.now() + (ttl * 1000);
    return { allowed: false, remaining: 0, resetTime };
  }

  // Increment counter
  await kv.incr(key);
  const ttl = await kv.ttl(key);
  const resetTime = Date.now() + (ttl * 1000);

  return { allowed: true, remaining: RATE_LIMIT_MAX - (current + 1), resetTime };
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords } = body;

    // Validate keywords
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { error: 'Keywords array is required' },
        { status: 400 }
      );
    }

    if (keywords.length > 3) {
      return NextResponse.json(
        { error: 'Maximum 3 keywords allowed' },
        { status: 400 }
      );
    }

    // Validate each keyword
    const validKeywords = keywords.filter((k: string) => typeof k === 'string' && k.trim().length > 0);
    if (validKeywords.length === 0) {
      return NextResponse.json(
        { error: 'At least one valid keyword is required' },
        { status: 400 }
      );
    }

    // Check rate limit
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(clientIp);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          remaining: 0,
          resetTime: rateLimit.resetTime,
        },
        { status: 429 }
      );
    }

    // Search Reddit URLs via SerpAPI
    // Client will fetch the actual posts to avoid 403 errors
    const urlsByKeyword = await searchMultipleKeywords(validKeywords);

    return NextResponse.json({
      urlsByKeyword,
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}