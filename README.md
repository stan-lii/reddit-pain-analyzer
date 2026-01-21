# Reddit Pain Point Analyzer

A Windows 98-themed web application that analyzes Reddit posts to identify pain points and generate business ideas using AI.

![Windows 98 Theme](https://img.shields.io/badge/theme-Windows%2098-008080?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)

## Features

- 🔍 **Smart Reddit Search**: Uses SerpAPI to find relevant Reddit discussions
- 🤖 **AI-Powered Analysis**: Google Gemini 2.0 Flash extracts pain points and business ideas
- 🎨 **Retro Windows 98 UI**: Nostalgic interface with authentic Win98 styling
- 📊 **5-Step Progress Tracking**: Visual feedback through the analysis pipeline
- 📄 **PDF Export**: Download comprehensive reports of analysis results
- ⏱️ **Rate Limiting**: Fair usage with 5 searches per 30 minutes
- 🌐 **Serverless**: Deployed on Vercel with zero configuration

## How It Works

1. **Enter Keywords**: Input up to 3 keywords related to your topic
2. **Search Reddit**: SerpAPI finds top Reddit posts containing your keywords
3. **Fetch Content**: Retrieves post content and comments via Reddit's JSON API
4. **AI Analysis**: Google Gemini analyzes the data to identify:
   - Pain points (with frequency, urgency, and context)
   - Business ideas (with viability scores and target markets)
5. **View Results**: Browse the analysis and download a PDF report

## Tech Stack

- **Framework**: Next.js 16.1.4 with App Router
- **Language**: TypeScript
- **Styling**: Custom CSS (Windows 98 theme)
- **AI**: Google Gemini 2.0 Flash
- **Search**: SerpAPI
- **Storage**: Vercel KV (Redis)
- **PDF**: jsPDF
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- API keys:
  - [Google Gemini API Key](https://ai.google.dev/)
  - [SerpAPI Key](https://serpapi.com/)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/reddit-pain-analyzer.git
cd reddit-pain-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
GEMINI_API_KEY=your_google_gemini_api_key
SERPAPI_API_KEY=your_serpapi_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Required
GEMINI_API_KEY=your_google_gemini_api_key
SERPAPI_API_KEY=your_serpapi_key

# Auto-populated by Vercel KV (when deployed)
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Import the project in [Vercel Dashboard](https://vercel.com/new)

3. Create a Vercel KV database:
   - Go to Storage → Create Database → KV
   - Name it `reddit-analyzer-kv`
   - Link it to your project

4. Add environment variables in Vercel:
   - `GEMINI_API_KEY`
   - `SERPAPI_API_KEY`

5. Deploy! Vercel will auto-detect the Next.js configuration

## Usage Limits

- **Searches**: 5 per IP address per 30 minutes
- **SerpAPI**: 100 searches/month (free tier)
- **Vercel KV**: 3,000 commands/day (hobby tier)
- **Google Gemini**: Check your quota in [AI Studio](https://ai.google.dev/)

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── search/       # Reddit search endpoint
│   │   ├── analyze/      # AI analysis endpoint
│   │   └── rate-limit/   # Rate limit check
│   ├── globals.css       # Windows 98 theme
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main application
├── components/
│   ├── ui/               # Reusable UI components
│   ├── SearchForm.tsx    # Keyword input
│   ├── ProgressTracker.tsx
│   ├── ResultsDisplay.tsx
│   └── RateLimitModal.tsx
└── lib/
    ├── serpapi.ts        # SerpAPI integration
    ├── reddit.ts         # Reddit API client
    ├── pdf.ts            # PDF generation
    └── types.ts          # TypeScript types
```

## API Endpoints

### POST /api/search
Search Reddit for posts containing keywords.

**Request:**
```json
{
  "keywords": ["productivity", "time management"]
}
```

**Response:**
```json
{
  "results": {
    "productivity": [/* array of Reddit posts */]
  },
  "remaining": 4
}
```

### POST /api/analyze
Analyze Reddit posts with AI.

**Request:**
```json
{
  "searchResults": {
    "productivity": [/* array of posts */]
  }
}
```

**Response:**
```json
{
  "analysis": [
    {
      "keyword": "productivity",
      "summary": "...",
      "painPoints": [...],
      "businessIdeas": [...]
    }
  ]
}
```

### GET /api/rate-limit
Check current rate limit status.

**Response:**
```json
{
  "remaining": 3,
  "resetTime": 1234567890,
  "limited": false
}
```

## Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Windows 98 design inspiration
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [SerpAPI](https://serpapi.com/) for search functionality
- [Reddit](https://www.reddit.com/) for their open JSON API

## Support

If you encounter any issues or have questions:

- Open an issue on GitHub
- Check the [CLAUDE.md](CLAUDE.md) file for detailed architecture documentation

## Roadmap

- [ ] Export to CSV format
- [ ] Save analysis history
- [ ] Custom AI prompts
- [ ] Multiple AI model support
- [ ] Batch keyword analysis
- [ ] Trending pain points dashboard

---

Made with 💾 and nostalgia for Windows 98.
