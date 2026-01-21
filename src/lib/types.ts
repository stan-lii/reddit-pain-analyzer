// Core data types for Reddit Pain Analyzer

export interface RedditPost {
  title: string;
  selftext: string;
  score: number;
  num_comments: number;
  url: string;
  subreddit: string;
  created_utc: number;
  author?: string;
  permalink?: string;
}

export interface RedditComment {
  body: string;
  score: number;
  author: string;
  created_utc: number;
}

export interface PainPoint {
  issue: string;
  frequency: number; // 0-100
  urgency: number; // 0-100
  context: string;
}

export interface BusinessIdea {
  idea: string;
  viability: number; // 0-100
  targetMarket: string;
  painPointsAddressed: string[];
  potentialRevenue: string;
}

export interface Analysis {
  keyword: string;
  painPoints: PainPoint[];
  businessIdeas: BusinessIdea[];
  summary: string;
}

export interface SearchResult {
  keyword: string;
  posts: RedditPost[];
}

export interface SearchResponse {
  results: Record<string, RedditPost[]>;
  remaining: number;
}

export interface AnalyzeRequest {
  searchResults: Record<string, RedditPost[]>;
}

export interface AnalyzeResponse {
  analysis: Analysis[];
}

export interface RateLimitResponse {
  remaining: number;
  resetTime: number;
  limited: boolean;
}

export interface SerpApiResult {
  position: number;
  title: string;
  link: string;
  displayed_link?: string;
  snippet?: string;
}

export interface SerpApiResponse {
  organic_results?: SerpApiResult[];
  error?: string;
}