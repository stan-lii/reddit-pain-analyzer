import { GoogleGenerativeAI } from '@google/generative-ai';
import { RedditPost, Analysis, PainPoint, BusinessIdea } from './types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not configured');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function analyzeRedditPosts(
  keyword: string,
  posts: RedditPost[]
): Promise<Analysis> {
  if (posts.length === 0) {
    return {
      keyword,
      painPoints: [],
      businessIdeas: [],
      summary: 'No Reddit posts found for this keyword.',
    };
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  // Prepare post data for analysis
  const postsText = posts
    .map((post, index) => {
      return `
POST ${index + 1}:
Title: ${post.title}
Subreddit: r/${post.subreddit}
Score: ${post.score} upvotes
Comments: ${post.num_comments}
Content:
${post.selftext || '[No text content]'}
---
`;
    })
    .join('\n');

  const prompt = `You are a business analyst specializing in identifying pain points and business opportunities from social media discussions.

Analyze the following Reddit posts related to the keyword "${keyword}". Extract pain points that users are experiencing and generate viable business ideas to address them.

REDDIT POSTS:
${postsText}

Provide your analysis in the following JSON format (respond ONLY with valid JSON, no markdown code blocks):

{
  "summary": "A 2-3 sentence summary of the overall theme and common issues discussed",
  "painPoints": [
    {
      "issue": "Clear description of the pain point",
      "frequency": 85,
      "urgency": 90,
      "context": "Brief explanation of why this matters"
    }
  ],
  "businessIdeas": [
    {
      "idea": "Business idea description",
      "viability": 80,
      "targetMarket": "Description of target market",
      "painPointsAddressed": ["Pain point 1", "Pain point 2"],
      "potentialRevenue": "Revenue model description (e.g., 'SaaS $49/mo, 10K users = $490K/mo')"
    }
  ]
}

REQUIREMENTS:
- Identify 3-7 pain points ranked by frequency (how often mentioned) and urgency (how severe)
- Generate 2-5 business ideas with realistic viability scores
- Frequency and urgency scores should be 0-100
- Viability scores should be 0-100
- Focus on actionable insights
- Be specific and concrete
- Return ONLY valid JSON (no markdown, no code blocks, no extra text)`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const analysis = JSON.parse(text);

    return {
      keyword,
      painPoints: analysis.painPoints || [],
      businessIdeas: analysis.businessIdeas || [],
      summary: analysis.summary || 'No summary available.',
    };
  } catch (error) {
    console.error(`Error analyzing posts for keyword "${keyword}":`, error);

    // Return fallback analysis on error
    return {
      keyword,
      painPoints: [
        {
          issue: 'Unable to analyze posts due to an error',
          frequency: 0,
          urgency: 0,
          context: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      ],
      businessIdeas: [],
      summary: 'Analysis failed. Please try again.',
    };
  }
}

export async function analyzeMultipleKeywords(
  postsByKeyword: Record<string, RedditPost[]>
): Promise<Analysis[]> {
  const analyses: Analysis[] = [];

  for (const [keyword, posts] of Object.entries(postsByKeyword)) {
    try {
      const analysis = await analyzeRedditPosts(keyword, posts);
      analyses.push(analysis);

      // Add small delay between Gemini API calls
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to analyze keyword "${keyword}":`, error);
      analyses.push({
        keyword,
        painPoints: [],
        businessIdeas: [],
        summary: 'Analysis failed for this keyword.',
      });
    }
  }

  return analyses;
}