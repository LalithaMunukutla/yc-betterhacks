import React from 'react';

interface ToolbarProps {
  paperTitle: string;
  numPages: number;
  isImplementing: boolean;
  onImplementPaper: () => void;
  onReset: () => void;
}

export default function Toolbar({
  paperTitle,
  numPages,
  isImplementing,
  onImplementPaper,
  onReset,
}: ToolbarProps) {
  return (
    <div className="h-14 border-b border-border bg-white flex items-center justify-between px-5 flex-shrink-0">
      {/* Left: paper info */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onReset}
          className="text-secondary hover:text-primary transition-colors text-sm flex-shrink-0"
          title="Upload a different paper"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary truncate">
            {paperTitle || 'Research Paper'}
          </p>
          <p className="text-xs text-secondary">
            {numPages} {numPages === 1 ? 'page' : 'pages'}
          </p>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onImplementPaper}
          disabled={isImplementing}
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${isImplementing
              ? 'bg-gray-100 text-secondary cursor-not-allowed'
              : 'bg-primary text-white hover:bg-gray-800'
            }
          `}
        >
          {isImplementing ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
              Implementing...
            </span>
          ) : (
            'Implement Paper'
          )}
        </button>
      </div>
    </div>
  );
}
