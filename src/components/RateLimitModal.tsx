'use client';

import React, { useEffect, useState } from 'react';
import Window from './ui/Window';
import Button from './ui/Button';

interface RateLimitModalProps {
  resetTime: number; // Unix timestamp in milliseconds
  onClose?: () => void;
}

export default function RateLimitModal({ resetTime, onClose }: RateLimitModalProps) {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const diff = resetTime - now;

      if (diff <= 0) {
        setTimeRemaining('00:00');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setTimeRemaining(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [resetTime]);

  return (
    <div className="modal-overlay">
      <Window title="Rate Limit Exceeded" className="rate-limit-modal">
        <div className="modal-content">
          <div className="modal-icon">⏱️</div>
          <h2>Too Many Requests</h2>
          <p>
            You have exceeded the rate limit of 5 searches per 30 minutes.
          </p>
          <p>
            Please wait before making another search request.
          </p>

          <div className="countdown">
            <div className="countdown-label">Time until reset:</div>
            <div className="countdown-timer">{timeRemaining}</div>
          </div>

          <div className="modal-hint">
            💡 Tip: Use this time to review your current results or download the PDF report.
          </div>

          {onClose && (
            <div className="modal-actions">
              <Button onClick={onClose}>OK</Button>
            </div>
          )}
        </div>
      </Window>
    </div>
  );
}