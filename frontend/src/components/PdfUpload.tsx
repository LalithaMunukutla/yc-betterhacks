import React, { useCallback, useRef, useState } from 'react';

interface PdfUploadProps {
  onFileSelected: (file: File) => void;
  onUrlSubmitted: (url: string) => void;
  isLoading: boolean;
  loadingMessage?: string;
}

export default function PdfUpload({ onFileSelected, onUrlSubmitted, isLoading, loadingMessage }: PdfUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [url, setUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file.');
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleUrlSubmit = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    onUrlSubmitted(trimmed);
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleUrlSubmit();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      {/* Subtle top accent line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          {/* Logo + Title */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h1 className="text-2xl font-semibold text-primary tracking-tight">
                Better Papers
              </h1>
            </div>
            <p className="text-secondary text-[15px]">
              Upload a PDF to start reading with adaptive explanations.
            </p>
          </div>

          {/* Upload area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
            className={`
              relative bg-white border-2 border-dashed rounded-xl p-14 cursor-pointer
              transition-all duration-200
              ${isDragging
                ? 'border-gray-400 bg-gray-50 scale-[1.01]'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
              }
              ${isLoading ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            {isLoading ? (
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-secondary text-sm">{loadingMessage || 'Processing PDF...'}</p>
              </div>
            ) : (
              <div className="text-center">
                <svg
                  className="w-10 h-10 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 16v-8m0 0l-3 3m3-3l3 3"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 16.7V19a2 2 0 01-2 2H6a2 2 0 01-2-2v-2.3"
                  />
                </svg>
                <p className="text-primary font-medium text-[15px] mb-1">
                  Drop your PDF here
                </p>
                <p className="text-secondary text-sm">
                  or click to choose a file
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleInputChange}
            className="hidden"
          />

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-sm text-secondary mb-2.5">
              Or add from URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleUrlKeyDown}
                placeholder="https://arxiv.org/pdf/1706.03762"
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 text-sm text-primary bg-white border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200 transition-colors disabled:opacity-50"
              />
              <button
                onClick={handleUrlSubmit}
                disabled={isLoading || !url.trim()}
                className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 flex-shrink-0"
              >
                Load
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
            <p className="mt-2.5 text-xs text-gray-400 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Supports arXiv, Semantic Scholar, direct PDF links
            </p>
          </div>

          {/* Features */}
          <div className="mt-14 grid grid-cols-3 gap-4">
            <FeatureCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              title="Highlight to Explain"
              description="Select any text to get instant contextual explanations"
            />
            <FeatureCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              }
              title="Implement Code"
              description="Turn equations and algorithms into working code"
            />
            <FeatureCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              title="Smart Citations"
              description="Click citations to see context and relevance"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Feature card sub-component */
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center px-2 py-4">
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-500">
        {icon}
      </div>
      <h3 className="text-[13px] font-medium text-primary mb-1">{title}</h3>
      <p className="text-xs text-secondary leading-relaxed">{description}</p>
    </div>
  );
}
