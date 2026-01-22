'use client';

import React, { useState } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';

interface SearchFormProps {
  onSearch: (keywords: string[]) => void;
  disabled?: boolean;
}

// Helper function to count keywords
function countKeywords(input: string): number {
  return input
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0)
    .length;
}

export default function SearchForm({ onSearch, disabled = false }: SearchFormProps) {
  const [keywordInput, setKeywordInput] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (newValue: string) => {
    const newCount = countKeywords(newValue);

    // Block input if trying to add a 4th keyword
    if (newCount > 3) {
      // Intelligently truncate to first 3 keywords
      const keywords = newValue
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .slice(0, 3);

      setKeywordInput(keywords.join(', '));
      setError('Maximum 3 keywords allowed');
      return;
    }

    // Clear error if count is valid
    if (newCount <= 3 && error === 'Maximum 3 keywords allowed') {
      setError('');
    }

    setKeywordInput(newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Parse keywords from comma-separated input
    const keywords = keywordInput
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    // Validate keywords
    if (keywords.length === 0) {
      setError('Please enter at least one keyword');
      return;
    }

    if (keywords.length > 3) {
      setError('Maximum 3 keywords allowed');
      return;
    }

    // Check for very short keywords
    const tooShort = keywords.find(k => k.length < 2);
    if (tooShort) {
      setError('Keywords must be at least 2 characters long');
      return;
    }

    onSearch(keywords);
  };

  const keywordCount = countKeywords(keywordInput);
  const isAtLimit = keywordCount >= 3;

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="form-group">
        <label htmlFor="keywords" className="form-label">
          Enter Keywords (comma-separated, max 3):
        </label>
        <Input
          value={keywordInput}
          onChange={handleInputChange}
          placeholder="e.g., productivity tools, time management, focus apps"
          disabled={disabled}
          className="keyword-input"
        />
        <div className="keyword-counter">
          {keywordInput.length > 0 && (
            <span className={isAtLimit ? 'limit-reached' : ''}>
              {keywordCount}/3 keywords
              {isAtLimit && ' - limit reached'}
            </span>
          )}
        </div>
        <div className="form-hint">
          Tip: Use specific keywords related to pain points or problems people discuss on Reddit
        </div>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <div className="form-actions">
        <Button type="submit" disabled={disabled || keywordInput.trim().length === 0}>
          🔍 Start Analysis
        </Button>
      </div>
    </form>
  );
}