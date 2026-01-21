import { SerpApiResponse, SerpApiResult } from './types';

const SERPAPI_KEY = process.env.SERPAPI_API_KEY;
const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';

export async function searchRedditPosts(keyword: string): Promise<string[]> {
  if (!SERPAPI_KEY) {
    throw new Error('SERPAPI_API_KEY is not configured');
  }

  const params = new URLSearchParams({
    engine: 'google',
    q: `site:reddit.com ${keyword}`,
    api_key: SERPAPI_KEY,
    num: '5', // Get top 5 results per keyword
  });

  const url = `${SERPAPI_BASE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`SerpAPI request failed: ${response.status} ${response.statusText}`);
    }

    const data: SerpApiResponse = await response.json();

    if (data.error) {
      throw new Error(`SerpAPI error: ${data.error}`);
    }

    if (!data.organic_results || data.organic_results.length === 0) {
      return [];
    }

    // Extract Reddit post URLs from results
    const redditUrls = data.organic_results
      .filter((result: SerpApiResult) => result.link && result.link.includes('reddit.com'))
      .map((result: SerpApiResult) => result.link)
      .slice(0, 5); // Ensure max 5 URLs

    return redditUrls;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to search Reddit posts: ${error.message}`);
    }
    throw new Error('Failed to search Reddit posts: Unknown error');
  }
}

export async function searchMultipleKeywords(keywords: string[]): Promise<Record<string, string[]>> {
  const results: Record<string, string[]> = {};

  // Process keywords sequentially to avoid rate limiting
  for (const keyword of keywords) {
    try {
      const urls = await searchRedditPosts(keyword);
      results[keyword] = urls;

      // Add delay between requests to be respectful to SerpAPI
      if (keywords.indexOf(keyword) < keywords.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
    } catch (error) {
      console.error(`Failed to search keyword "${keyword}":`, error);
      results[keyword] = []; // Return empty array on failure
    }
  }

  return results;
}