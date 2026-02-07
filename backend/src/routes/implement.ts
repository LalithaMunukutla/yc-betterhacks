import { Router, Request, Response } from 'express';
import { runFullPipeline } from '../services/claude';
import { uploadNotebookToGist } from '../services/gist';
import { getCache, setCache } from '../services/cache';

const router = Router();

// Type for the cached response data
interface ImplementResult {
  colabUrl: string;
  gistUrl: string;
  downloadUrl: string;
  analysis: Record<string, unknown>;
  plan: Record<string, unknown>;
  notebookCells: Array<{ cell_type: string; source: string }>;
  meta: Record<string, unknown>;
}

/**
 * POST /api/implement-paper
 *
 * Accepts the extracted paper text and runs the full pipeline:
 * 1. Check cache — if this paper was processed before, return instantly
 * 2. Analyze the paper (Claude)
 * 3. Create an implementation plan (Claude)
 * 4. Generate a Colab notebook (Claude)
 * 5. Upload the notebook to GitHub Gist
 * 6. Cache the result and return everything
 */
router.post('/implement-paper', async (req: Request, res: Response) => {
  try {
    const { paperText } = req.body;

    if (!paperText || typeof paperText !== 'string') {
      res.status(400).json({ error: 'Missing "paperText" in request body.' });
      return;
    }

    if (paperText.length < 100) {
      res.status(400).json({ error: 'Paper text is too short. Please provide the full paper text.' });
      return;
    }

    // Check cache first
    const cached = getCache<ImplementResult>(paperText);
    if (cached) {
      console.log('[Implement] Returning cached result (instant)');
      res.json({ success: true, data: cached });
      return;
    }

    console.log(`[Implement] Starting pipeline for paper (${paperText.length} chars)...`);
    const startTime = Date.now();

    // Run the 3-step Claude pipeline
    const { analysis, plan, notebook } = await runFullPipeline(paperText);

    // Upload to GitHub Gist
    console.log('[Implement] Uploading notebook to Gist...');
    const gist = await uploadNotebookToGist(notebook.notebookJson, notebook.colabTitle);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Implement] Pipeline complete in ${duration}s`);

    const responseData: ImplementResult = {
      colabUrl: gist.colabUrl,
      gistUrl: gist.gistUrl,
      downloadUrl: gist.rawUrl,

      analysis: {
        title: analysis.title,
        domain: analysis.domain,
        coreProblem: analysis.coreProblem,
        coreContribution: analysis.coreContribution,
        paperComplexity: analysis.paperComplexity,
        methods: analysis.methods,
        requiredLibraries: analysis.requiredLibraries,
      },

      plan: {
        summary: plan.summary,
        framework: plan.framework,
        frameworkReasoning: plan.frameworkReasoning,
        simplifications: plan.simplifications,
        steps: plan.steps,
        demoDataStrategy: plan.demoDataStrategy,
      },

      notebookCells: notebook.cells,

      meta: {
        totalCells: notebook.cells.length,
        codeCells: notebook.cells.filter((c) => c.cell_type === 'code').length,
        markdownCells: notebook.cells.filter((c) => c.cell_type === 'markdown').length,
        pipelineDurationSeconds: parseFloat(duration),
      },
    };

    // Cache the result for instant replay
    setCache(paperText, responseData);

    res.json({ success: true, data: responseData });
  } catch (error) {
    console.error('[Implement] Pipeline error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      error: 'Failed to generate implementation.',
      detail: message,
    });
  }
});

export default router;
