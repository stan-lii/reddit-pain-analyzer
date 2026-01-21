# Reddit Pain Point Analyzer

## Project Overview

A Windows 98-themed web application that analyzes Reddit posts to identify pain points and generate business ideas using AI. The app searches Reddit via SerpAPI, fetches post content using Reddit's JSON API, and uses Google Gemini 2.0 Flash for intelligent analysis.

## Architecture

### Tech Stack

- **Framework**: Next.js 16.1.4 (App Router) with TypeScript
- **Styling**: Custom CSS (Windows 98 retro theme)
- **APIs**:
  - SerpAPI (Google search for Reddit posts)
  - Reddit JSON API (fetch post content)
  - Google Gemini 2.0 Flash (AI analysis)
- **Storage**: Vercel KV (rate limiting)
- **PDF Export**: jsPDF (client-side generation)
- **Hosting**: Vercel

### Project Structure

```
src/
├── app/
│   ├── globals.css              # Windows 98 theme styles
│   ├── page.tsx                 # Main application interface
│   ├── layout.tsx               # Root layout
│   └── api/
│       ├── search/route.ts      # Search Reddit via SerpAPI
│       ├── analyze/route.ts     # AI analysis with Gemini
│       └── rate-limit/route.ts  # Check rate limit status
├── components/
│   ├── ui/
│   │   ├── Window.tsx           # Win98 window chrome
│   │   ├── Button.tsx           # Win98 button component
│   │   └── Input.tsx            # Win98 input field
│   ├── SearchForm.tsx           # Keyword input form (3 max)
│   ├── ProgressTracker.tsx      # 5-step progress indicator
│   ├── ResultsDisplay.tsx       # Analysis results display
│   └── RateLimitModal.tsx       # Rate limit countdown modal
└── lib/
    ├── types.ts                 # TypeScript interfaces
    ├── serpapi.ts               # SerpAPI integration
    ├── reddit.ts                # Reddit JSON API client
    ├── gemini.ts                # Google Gemini AI client
    └── pdf.ts                   # PDF generation utility
```

## API Endpoints

### POST /api/search

Searches Reddit for posts related to keywords using SerpAPI.

**Request:**
```json
{
  "keywords": ["keyword1", "keyword2", "keyword3"]
}
```

**Response:**
```json
{
  "results": {
    "keyword1": [/* RedditPost[] */],
    "keyword2": [/* RedditPost[] */]
  },
  "remaining": 3
}
```

**Rate Limiting:**
- 5 searches per IP per 30 minutes
- Returns 429 status with remaining time if exceeded

### POST /api/analyze

Analyzes Reddit posts using Google Gemini AI to extract pain points and business ideas.

**Request:**
```json
{
  "searchResults": {
    "keyword1": [/* RedditPost[] */],
    "keyword2": [/* RedditPost[] */]
  }
}
```

**Response:**
```json
{
  "analysis": [
    {
      "keyword": "keyword1",
      "summary": "...",
      "painPoints": [
        {
          "issue": "...",
          "frequency": 85,
          "urgency": 90,
          "context": "..."
        }
      ],
      "businessIdeas": [
        {
          "idea": "...",
          "viability": 80,
          "targetMarket": "...",
          "painPointsAddressed": ["..."],
          "potentialRevenue": "..."
        }
      ]
    }
  ]
}
```

### GET /api/rate-limit

Checks current rate limit status for the client IP.

**Response:**
```json
{
  "remaining": 3,
  "resetTime": 1234567890,
  "limited": false
}
```

## Data Types

### RedditPost
```typescript
interface RedditPost {
  title: string;
  selftext: string;
  score: number;
  num_comments: number;
  url: string;
  subreddit: string;
  created_utc: number;
}
```

### PainPoint
```typescript
interface PainPoint {
  issue: string;
  frequency: number;      // 0-100
  urgency: number;        // 0-100
  context: string;
}
```

### BusinessIdea
```typescript
interface BusinessIdea {
  idea: string;
  viability: number;      // 0-100
  targetMarket: string;
  painPointsAddressed: string[];
  potentialRevenue: string;
}
```

### Analysis
```typescript
interface Analysis {
  keyword: string;
  painPoints: PainPoint[];
  businessIdeas: BusinessIdea[];
  summary: string;
}
```

## User Flow

1. **Enter Keywords** (Step 0)
   - User enters up to 3 comma-separated keywords
   - Clicks "Start Analysis" button

2. **Searching Google** (Step 1)
   - SerpAPI searches `site:reddit.com {keyword}`
   - Returns top 5 Reddit post URLs per keyword

3. **Fetching Reddit** (Step 2)
   - Fetches post data via Reddit JSON API
   - Includes post content and top 10 comments
   - 1 second delay between requests (rate limit courtesy)

4. **AI Analysis** (Step 3)
   - Sends post data to Google Gemini 2.0 Flash
   - AI extracts pain points and generates business ideas
   - Returns structured JSON analysis

5. **Complete** (Step 4)
   - Displays analysis results
   - User can download PDF report
   - User can start new search

## Rate Limiting

- **Limit**: 5 searches per IP per 30 minutes
- **Storage**: Vercel KV with TTL
- **Key Format**: `rate_limit:{IP_ADDRESS}`
- **Response**: 429 status with remaining time
- **UI**: Countdown modal showing MM:SS until reset

## Environment Variables

Required environment variables (set in Vercel Dashboard):

```bash
GEMINI_API_KEY=your_google_gemini_api_key
SERPAPI_API_KEY=your_serpapi_key

# Auto-populated by Vercel KV:
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

## Development

### Local Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local`:
```bash
GEMINI_API_KEY=your_key_here
SERPAPI_API_KEY=your_key_here
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### Testing Checklist

- [ ] Search form accepts up to 3 keywords
- [ ] Progress tracker updates through all 5 steps
- [ ] Windows 98 UI renders correctly
- [ ] SerpAPI returns valid Reddit URLs
- [ ] Reddit JSON fetch works (with delays)
- [ ] Gemini analysis returns structured JSON
- [ ] Rate limiting activates after 5 searches
- [ ] Countdown modal displays remaining time
- [ ] PDF downloads with correct content
- [ ] Error handling works gracefully

## Deployment

### Vercel Setup

1. **Create Vercel Project**
   - Link GitHub repository
   - Auto-detects Next.js build settings

2. **Create Vercel KV Database**
   - Dashboard → Storage → Create Database → KV
   - Name: `reddit-analyzer-kv`
   - Link to project

3. **Add Environment Variables**
   - Dashboard → Settings → Environment Variables
   - Add `GEMINI_API_KEY` and `SERPAPI_API_KEY`
   - KV variables auto-populate when linked

4. **Deploy**
   - Push to main branch for auto-deployment
   - Or use `vercel --prod` from CLI

### Production Monitoring

- **SerpAPI Usage**: Monitor at serpapi.com dashboard
- **Gemini Quota**: Check Google AI Studio
- **Vercel KV**: Monitor in Vercel dashboard
- **Function Logs**: Check Vercel function logs for errors

## Notes

- **No .env files in repo**: All secrets managed via Vercel Dashboard
- **Client-side PDF**: Reduces server costs, runs in browser
- **Graceful failures**: Skips deleted/private Reddit posts
- **JSON cleaning**: Removes markdown code blocks from AI responses
- **1s delays**: Respects Reddit's informal rate limits
- **IP detection**: Uses `x-forwarded-for` header for rate limiting

## API Limits

- **SerpAPI**: 100 searches/month (free tier)
- **Vercel KV**: 3,000 commands/day (hobby tier)
- **Google Gemini**: Check current quota in AI Studio
- **Reddit JSON**: Informal limit, use 1s delays

## Windows 98 Theme

The app uses authentic Windows 98 design elements:
- Classic silver/grey color scheme
- Inset/outset borders for 3D effect
- MS Sans Serif font (system fallback)
- Window chrome with title bar and controls
- Button active/hover states
- Progress tracker with step indicators
- Modal dialogs with proper layering