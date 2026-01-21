'use client';

import React from 'react';
import { Analysis } from '@/lib/types';
import Button from './ui/Button';

interface ResultsDisplayProps {
  analysis: Analysis[];
  onDownloadPDF: () => void;
  onNewSearch: () => void;
}

export default function ResultsDisplay({ analysis, onDownloadPDF, onNewSearch }: ResultsDisplayProps) {
  if (!analysis || analysis.length === 0) {
    return (
      <div className="results-empty">
        <p>No analysis results available.</p>
        <Button onClick={onNewSearch}>Start New Search</Button>
      </div>
    );
  }

  return (
    <div className="results-display">
      <div className="results-header">
        <h2>📊 Analysis Results</h2>
        <div className="results-actions">
          <Button onClick={onDownloadPDF}>💾 Download PDF</Button>
          <Button onClick={onNewSearch}>🔄 New Search</Button>
        </div>
      </div>

      <div className="results-content">
        {analysis.map((item, index) => (
          <div key={index} className="keyword-analysis">
            <div className="keyword-header">
              <h3>🔑 Keyword: {item.keyword}</h3>
            </div>

            <div className="summary-section">
              <h4>Summary</h4>
              <p>{item.summary}</p>
            </div>

            {item.painPoints.length > 0 && (
              <div className="pain-points-section">
                <h4>😣 Pain Points ({item.painPoints.length})</h4>
                <div className="pain-points-list">
                  {item.painPoints
                    .sort((a, b) => (b.frequency + b.urgency) - (a.frequency + a.urgency))
                    .map((pain, idx) => (
                      <div key={idx} className="pain-point-card">
                        <div className="pain-point-header">
                          <div className="pain-point-issue">{pain.issue}</div>
                          <div className="pain-point-badges">
                            <span className="badge frequency" title="Frequency">
                              📊 {pain.frequency}%
                            </span>
                            <span className="badge urgency" title="Urgency">
                              🔥 {pain.urgency}%
                            </span>
                          </div>
                        </div>
                        <div className="pain-point-context">{pain.context}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {item.businessIdeas.length > 0 && (
              <div className="business-ideas-section">
                <h4>💡 Business Ideas ({item.businessIdeas.length})</h4>
                <div className="business-ideas-list">
                  {item.businessIdeas
                    .sort((a, b) => b.viability - a.viability)
                    .map((idea, idx) => (
                      <div key={idx} className="business-idea-card">
                        <div className="business-idea-header">
                          <div className="business-idea-title">{idea.idea}</div>
                          <div className="viability-badge">
                            ✅ {idea.viability}% viable
                          </div>
                        </div>

                        <div className="business-idea-details">
                          <div className="detail-row">
                            <strong>🎯 Target Market:</strong> {idea.targetMarket}
                          </div>
                          <div className="detail-row">
                            <strong>💰 Revenue Potential:</strong> {idea.potentialRevenue}
                          </div>
                          <div className="detail-row">
                            <strong>🎯 Addresses:</strong>{' '}
                            {idea.painPointsAddressed.join(', ')}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="results-footer">
        <Button onClick={onDownloadPDF} className="primary">
          💾 Download PDF Report
        </Button>
        <Button onClick={onNewSearch}>🔄 Start New Search</Button>
      </div>
    </div>
  );
}