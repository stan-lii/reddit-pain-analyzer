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

export async function fetchRedditPostClient(url: string): Promise<RedditPost | null> {
  try {
    let jsonUrl = url;
    if (!url.endsWith('.json')) {
      jsonUrl = url.replace(/\/$/, '') + '.json';
    }

    // Direct fetch from browser - no 403 blocking!
    const response = await fetch(jsonUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch Reddit post: ${response.status}`);
      return null;
    }

    const data: RedditApiResponse[] = await response.json();

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

    // Combine post text with top comments
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

export async function fetchMultiplePostsClient(urls: string[]): Promise<RedditPost[]> {
  const posts: RedditPost[] = [];

  for (const url of urls) {
    try {
      const post = await fetchRedditPostClient(url);
      if (post) {
        posts.push(post);
      }

      // Add 1 second delay between requests
      if (urls.indexOf(url) < urls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Failed to fetch post from ${url}:`, error);
    }
  }

  return posts;
}
