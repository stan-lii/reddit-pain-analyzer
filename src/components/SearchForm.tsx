'use client';

import React, { useState } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';

interface SearchFormProps {
  onSearch: (keywords: string[]) => void;
  disabled?: boolean;
}

export default function SearchForm({ onSearch, disabled = false }: SearchFormProps) {
  const [keywordInput, setKeywordInput] = useState('');
  const [error, setError] = useState('');

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

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="form-group">
        <label htmlFor="keywords" className="form-label">
          Enter Keywords (comma-separated, max 3):
        </label>
        <Input
          value={keywordInput}
          onChange={setKeywordInput}
          placeholder="e.g., productivity tools, time management, focus apps"
          disabled={disabled}
          className="keyword-input"
        />
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