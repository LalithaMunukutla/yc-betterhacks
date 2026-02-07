const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Uploads a PDF file to the backend and returns extracted text.
 */
export async function extractPdf(file: File): Promise<{
  text: string;
  numPages: number;
  title: string;
  characterCount: number;
}> {
  const formData = new FormData();
  formData.append('pdf', file);

  const response = await fetch(`${API_BASE}/api/extract-pdf`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || `Upload failed with status ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Sends paper text to the backend to generate a Colab implementation.
 */
export async function implementPaper(paperText: string): Promise<{
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
}> {
  const response = await fetch(`${API_BASE}/api/implement-paper`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paperText }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Implementation failed' }));
    throw new Error(error.error || `Implementation failed with status ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}
