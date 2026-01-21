'use client';

import React, { useState } from 'react';
import Window from '@/components/ui/Window';
import SearchForm from '@/components/SearchForm';
import ProgressTracker from '@/components/ProgressTracker';
import ResultsDisplay from '@/components/ResultsDisplay';
import RateLimitModal from '@/components/RateLimitModal';
import { Analysis, AnalyzeResponse, RedditPost } from '@/lib/types';
import { fetchMultiplePostsClient } from '@/lib/reddit-client';

type AppState = 'idle' | 'searching' | 'fetching' | 'analyzing' | 'complete' | 'rate-limited';

export default function Home() {
  const [state, setState] = useState<AppState>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [analysis, setAnalysis] = useState<Analysis[]>([]);
  const [rateLimitResetTime, setRateLimitResetTime] = useState(0);
  const [error, setError] = useState('');

  const handleSearch = async (keywords: string[]) => {
    try {
      setError('');
      setState('searching');
      setCurrentStep(1); // Searching Google

      // Step 1: Search for Reddit URLs via SerpAPI
      const searchResponse = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords }),
      });

      if (searchResponse.status === 429) {
        const rateLimitData = await searchResponse.json();
        setRateLimitResetTime(rateLimitData.resetTime);
        setState('rate-limited');
        return;
      }

      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        throw new Error(errorData.error || 'Search failed');
      }

      const { urlsByKeyword } = await searchResponse.json();

      // Step 2: Fetch Reddit posts CLIENT-SIDE (bypasses 403 blocking)
      setState('fetching');
      setCurrentStep(2); // Fetching Reddit

      const postsByKeyword: Record<string, RedditPost[]> = {};

      for (const [keyword, urls] of Object.entries(urlsByKeyword)) {
        postsByKeyword[keyword] = await fetchMultiplePostsClient(urls as string[]);
      }

      // Check if we got any results
      const totalPosts = Object.values(postsByKeyword).reduce(
        (sum, posts) => sum + posts.length,
        0
      );

      if (totalPosts === 0) {
        throw new Error('No Reddit posts found for the given keywords');
      }

      // Step 3: Analyze with AI
      setState('analyzing');
      setCurrentStep(3); // AI Analysis

      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchResults: postsByKeyword }),
      });

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const analyzeData: AnalyzeResponse = await analyzeResponse.json();

      // Step 4: Complete
      setAnalysis(analyzeData.analysis);
      setState('complete');
      setCurrentStep(4); // Complete
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setState('idle');
      setCurrentStep(0);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // Dynamically import PDF generation to reduce initial bundle size
      const { generatePDF } = await import('@/lib/pdf');
      await generatePDF(analysis);
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  const handleNewSearch = () => {
    setState('idle');
    setCurrentStep(0);
    setAnalysis([]);
    setError('');
  };

  const handleRateLimitClose = () => {
    setState('idle');
    setCurrentStep(0);
  };

  const isProcessing = state === 'searching' || state === 'fetching' || state === 'analyzing';

  return (
    <div className="app-container">
      <div className="desktop">
        <Window title="Reddit Pain Point Analyzer - Windows 98 Edition" className="main-window">
          <div className="app-content">
            <div className="app-header">
              <h1>🔍 Reddit Pain Point Analyzer</h1>
              <p className="app-description">
                Discover pain points and business opportunities from Reddit discussions using AI
              </p>
            </div>

            {state !== 'complete' && (
              <>
                <SearchForm onSearch={handleSearch} disabled={isProcessing} />

                {isProcessing && (
                  <div className="progress-section">
                    <ProgressTracker currentStep={currentStep} />
                    <div className="loading-message">
                      {state === 'searching' && '🔎 Searching Reddit via Google...'}
                      {state === 'fetching' && '📥 Fetching Reddit posts and comments...'}
                      {state === 'analyzing' && '🤖 Analyzing with Google Gemini AI...'}
                    </div>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="error-section">
                <div className="error-box">
                  <strong>❌ Error:</strong> {error}
                </div>
              </div>
            )}

            {state === 'complete' && (
              <ResultsDisplay
                analysis={analysis}
                onDownloadPDF={handleDownloadPDF}
                onNewSearch={handleNewSearch}
              />
            )}
          </div>

          <div className="status-bar">
            <div className="status-item">
              {state === 'idle' && '💤 Ready'}
              {state === 'searching' && '🔍 Searching...'}
              {state === 'fetching' && '📥 Fetching...'}
              {state === 'analyzing' && '🤖 Analyzing...'}
              {state === 'complete' && '✅ Complete'}
              {state === 'rate-limited' && '⏱️ Rate Limited'}
            </div>
          </div>
        </Window>

        <div className="desktop-info">
          <div className="desktop-icon">
            <div className="icon">💾</div>
            <div className="icon-label">My Computer</div>
          </div>
          <div className="desktop-icon">
            <div className="icon">🗑️</div>
            <div className="icon-label">Recycle Bin</div>
          </div>
        </div>
      </div>

      {state === 'rate-limited' && (
        <RateLimitModal resetTime={rateLimitResetTime} onClose={handleRateLimitClose} />
      )}
    </div>
  );
}