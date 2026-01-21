import { RedditPost, RedditComment } from './types';

interface RedditApiPost {
  data: {
    title: string;
    selftext: string;
    score: number;
    num_comments: number;
    url: string;
    subreddit: string;
    created_utc: number;
    author?: string;
    permalink?: string;
  };
}

interface RedditApiComment {
  data: {
    body?: string;
    score?: number;
    author?: string;
    created_utc?: number;
  };
}

interface RedditApiResponse {
  data?: {
    children?: RedditApiPost[] | RedditApiComment[];
  };
}

export async function fetchRedditPost(url: string): Promise<RedditPost | null> {
  try {
    // Convert Reddit URL to JSON API format
    // Example: https://reddit.com/r/foo/comments/abc123/title
    // Becomes: https://reddit.com/r/foo/comments/abc123/title.json
    let jsonUrl = url;
    if (!url.endsWith('.json')) {
      jsonUrl = url.replace(/\/$/, '') + '.json';
    }

    const response = await fetch(jsonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/html, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.reddit.com/',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch Reddit post: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: RedditApiResponse[] = await response.json();

    // Reddit JSON API returns array: [post_data, comments_data]
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const postData = data[0];
    if (!postData.data?.children || postData.data.children.length === 0) {
      return null;
    }

    const post = (postData.data.children[0] as RedditApiPost).data;

    // Get top comments
    const commentsData = data[1];
    const comments: RedditComment[] = [];

    if (commentsData?.data?.children) {
      for (const child of commentsData.data.children.slice(0, 10)) {
        const comment = (child as RedditApiComment).data;
        if (comment.body && comment.body !== '[deleted]' && comment.body !== '[removed]') {
          comments.push({
            body: comment.body,
            score: comment.score || 0,
            author: comment.author || '[unknown]',
            created_utc: comment.created_utc || 0,
          });
        }
      }
    }

    // Combine post text with top comments for richer context
    let enrichedText = post.selftext || '';
    if (comments.length > 0) {
      enrichedText += '\n\n--- Top Comments ---\n\n';
      enrichedText += comments
        .map(c => `[${c.score} upvotes] ${c.body}`)
        .join('\n\n');
    }

    return {
      title: post.title,
      selftext: enrichedText,
      score: post.score,
      num_comments: post.num_comments,
      url: post.url,
      subreddit: post.subreddit,
      created_utc: post.created_utc,
      author: post.author,
      permalink: post.permalink,
    };
  } catch (error) {
    console.error(`Error fetching Reddit post from ${url}:`, error);
    return null;
  }
}

export async function fetchMultiplePosts(urls: string[]): Promise<RedditPost[]> {
  const posts: RedditPost[] = [];

  for (const url of urls) {
    try {
      const post = await fetchRedditPost(url);
      if (post) {
        posts.push(post);
      }

      // Add 1 second delay between requests to respect Reddit's informal rate limits
      if (urls.indexOf(url) < urls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Failed to fetch post from ${url}:`, error);
      // Continue with next URL
    }
  }

  return posts;
}

export async function fetchPostsByKeyword(
  urlsByKeyword: Record<string, string[]>
): Promise<Record<string, RedditPost[]>> {
  const results: Record<string, RedditPost[]> = {};

  for (const [keyword, urls] of Object.entries(urlsByKeyword)) {
    results[keyword] = await fetchMultiplePosts(urls);
  }

  return results;
}