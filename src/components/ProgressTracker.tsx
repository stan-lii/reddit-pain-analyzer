import React from 'react';

interface ProgressTrackerProps {
  currentStep: number; // 0-4
}

const steps = [
  'Enter Keywords',
  'Searching Google',
  'Fetching Reddit',
  'AI Analysis',
  'Complete'
];

export default function ProgressTracker({ currentStep }: ProgressTrackerProps) {
  return (
    <div className="progress-tracker">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div
            className={`progress-step ${
              index === currentStep
                ? 'active'
                : index < currentStep
                ? 'completed'
                : ''
            }`}
          >
            <span className="progress-step-icon">
              {index < currentStep ? '✓' : index === currentStep ? '●' : '○'}
            </span>
            <span>{step}</span>
          </div>
          {index < steps.length - 1 && (
            <span className="progress-arrow">→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}