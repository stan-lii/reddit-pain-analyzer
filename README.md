# Reddit Pain Point Analyzer

A web application that analyzes Reddit posts to identify pain points and generate business ideas using AI.

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
- [ ] Batch keyword analysis
- [ ] Trending pain points dashboard

---

Made with 💾 and nostalgia for Windows 98.
