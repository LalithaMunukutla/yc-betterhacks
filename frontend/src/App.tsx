import React, { useState, useCallback } from 'react';
import PdfUpload from './components/PdfUpload';
import PaperViewer from './components/PaperViewer';
import Toolbar from './components/Toolbar';
import { extractPdf, implementPaper } from './services/api';

// Types for the implementation result
interface ImplementationResult {
  colabUrl: string;
  gistUrl: string;
  downloadUrl: string;
  analysis: {
    title: string;
    domain: string;
    coreProblem: string;
    coreContribution: string;
    paperComplexity: string;
    methods: Array<{ name: string; description: string; section: string }>;
    requiredLibraries: string[];
  };
  plan: {
    summary: string;
    framework: string;
    frameworkReasoning: string;
    simplifications: string[];
    steps: Array<{
      order: number;
      title: string;
      description: string;
      components: string[];
      estimatedLines: number;
    }>;
    demoDataStrategy: string;
  };
  notebookCells: Array<{
    cell_type: 'markdown' | 'code';
    source: string;
  }>;
  meta: {
    totalCells: number;
    codeCells: number;
    markdownCells: number;
    pipelineDurationSeconds: number;
  };
}

// App states
type AppState = 'upload' | 'reading';

export default function App() {
  // App state
  const [appState, setAppState] = useState<AppState>('upload');

  // PDF data
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [paperText, setPaperText] = useState<string>('');
  const [paperTitle, setPaperTitle] = useState<string>('');
  const [numPages, setNumPages] = useState<number>(0);

  // Loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isImplementing, setIsImplementing] = useState(false);

  // Implementation result (used in Step 6)
  const [implementResult, setImplementResult] = useState<ImplementationResult | null>(null);
  const [implementError, setImplementError] = useState<string>('');

  // Handle PDF file selection
  const handleFileSelected = useCallback(async (file: File) => {
    setIsUploading(true);
    setImplementError('');

    try {
      // Create a blob URL for the PDF viewer
      const url = URL.createObjectURL(file);
      setPdfUrl(url);

      // Extract text from the PDF via backend
      const result = await extractPdf(file);
      setPaperText(result.text);
      setPaperTitle(result.title || file.name.replace('.pdf', ''));
      setNumPages(result.numPages);
      setAppState('reading');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process PDF';
      alert(message);
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Handle "Implement Paper" button click
  const handleImplementPaper = useCallback(async () => {
    if (!paperText) return;

    setIsImplementing(true);
    setImplementError('');
    setImplementResult(null);

    try {
      const result = await implementPaper(paperText);
      setImplementResult(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate implementation';
      setImplementError(message);
    } finally {
      setIsImplementing(false);
    }
  }, [paperText]);

  // Reset to upload state
  const handleReset = useCallback(() => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl('');
    setPaperText('');
    setPaperTitle('');
    setNumPages(0);
    setImplementResult(null);
    setImplementError('');
    setAppState('upload');
  }, [pdfUrl]);

  // Upload screen
  if (appState === 'upload') {
    return <PdfUpload onFileSelected={handleFileSelected} isLoading={isUploading} />;
  }

  // Reading screen with PDF viewer
  return (
    <div className="h-screen flex flex-col bg-white">
      <Toolbar
        paperTitle={paperTitle}
        numPages={numPages}
        isImplementing={isImplementing}
        onImplementPaper={handleImplementPaper}
        onReset={handleReset}
      />

      <div className="flex-1 flex min-h-0">
        {/* PDF Viewer */}
        <div className={`flex-1 flex flex-col min-w-0 ${implementResult ? 'w-1/2' : 'w-full'}`}>
          <PaperViewer pdfUrl={pdfUrl} />
        </div>

        {/* Implementation Panel placeholder — will be built in Step 6 */}
        {(implementResult || isImplementing || implementError) && (
          <div className="w-[480px] border-l border-border flex flex-col bg-white flex-shrink-0">
            {isImplementing && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm font-medium text-primary">Generating implementation...</p>
                  <p className="text-xs text-secondary mt-1">This may take 20-30 seconds</p>
                </div>
              </div>
            )}

            {implementError && (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <p className="text-sm text-red-600 mb-3">{implementError}</p>
                  <button
                    onClick={handleImplementPaper}
                    className="text-sm text-primary underline hover:no-underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {implementResult && !isImplementing && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header with Colab link */}
                <div className="p-4 border-b border-border">
                  <h2 className="text-sm font-semibold text-primary mb-3">Implementation Ready</h2>
                  <a
                    href={implementResult.colabUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-2.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Open in Google Colab
                  </a>
                  <div className="flex gap-2 mt-2">
                    <a
                      href={implementResult.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-3 py-1.5 border border-border rounded-md text-xs text-secondary hover:text-primary hover:border-gray-400 transition-colors"
                    >
                      Download .ipynb
                    </a>
                    <a
                      href={implementResult.gistUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-3 py-1.5 border border-border rounded-md text-xs text-secondary hover:text-primary hover:border-gray-400 transition-colors"
                    >
                      View on GitHub
                    </a>
                  </div>
                </div>

                {/* Notebook preview placeholder — detailed rendering in Step 6 */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">Summary</h3>
                    <p className="text-sm text-primary leading-relaxed">{implementResult.plan.summary}</p>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
                      Framework: {implementResult.plan.framework}
                    </h3>
                    <p className="text-xs text-secondary leading-relaxed">{implementResult.plan.frameworkReasoning}</p>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
                      Implementation Steps
                    </h3>
                    <div className="space-y-2">
                      {implementResult.plan.steps.map((step) => (
                        <div key={step.order} className="flex gap-2 text-sm">
                          <span className="text-secondary font-mono text-xs mt-0.5">{step.order}.</span>
                          <div>
                            <p className="font-medium text-primary text-sm">{step.title}</p>
                            <p className="text-xs text-secondary">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-secondary border-t border-border pt-3 mt-4">
                    Generated in {implementResult.meta.pipelineDurationSeconds}s
                    — {implementResult.meta.totalCells} cells
                    ({implementResult.meta.codeCells} code, {implementResult.meta.markdownCells} markdown)
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
