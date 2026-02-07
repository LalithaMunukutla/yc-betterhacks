import React from 'react';

interface PaperViewerProps {
  pdfUrl: string;
}

/**
 * Renders the uploaded PDF using the browser's built-in PDF viewer.
 * This is the simplest approach that works well — the browser handles
 * scrolling, zooming, and text selection natively.
 */
export default function PaperViewer({ pdfUrl }: PaperViewerProps) {
  return (
    <div className="flex-1 bg-gray-50">
      <iframe
        src={pdfUrl}
        title="Research Paper"
        className="w-full h-full border-0"
        style={{ minHeight: 0 }}
      />
    </div>
  );
}
