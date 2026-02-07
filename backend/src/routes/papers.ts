import { Router } from 'express'
import { uploadPdf } from '../middleware/upload'
import {
  uploadPaper,
  getPaper,
  getCitationContext,
  getPaperText,
} from '../controllers/papers'

const router = Router()

router.post('/upload', uploadPdf, uploadPaper)
router.get('/:paperId', getPaper)
router.get('/:paperId/citations/:citationKey', getCitationContext)
router.get('/:paperId/text', getPaperText)

export { router as papersRouter }
