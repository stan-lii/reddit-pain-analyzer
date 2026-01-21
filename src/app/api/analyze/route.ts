import { NextRequest, NextResponse } from 'next/server';
import { analyzeMultipleKeywords } from '@/lib/gemini';
import { AnalyzeRequest, AnalyzeResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { searchResults } = body;

    // Validate search results
    if (!searchResults || typeof searchResults !== 'object') {
      return NextResponse.json(
        { error: 'Search results object is required' },
        { status: 400 }
      );
    }

    const keywords = Object.keys(searchResults);
    if (keywords.length === 0) {
      return NextResponse.json(
        { error: 'No keywords found in search results' },
        { status: 400 }
      );
    }

    // Validate that each keyword has an array of posts
    for (const keyword of keywords) {
      if (!Array.isArray(searchResults[keyword])) {
        return NextResponse.json(
          { error: `Invalid posts array for keyword: ${keyword}` },
          { status: 400 }
        );
      }
    }

    // Analyze posts using Google Gemini AI
    const analysis = await analyzeMultipleKeywords(searchResults);

    const response: AnalyzeResponse = {
      analysis,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}