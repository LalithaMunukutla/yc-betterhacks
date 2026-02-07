import express, { Request, Response } from 'express'
import cors from 'cors'
import { env } from './config/env'
import { papersRouter } from './routes/papers'
import { errorHandler } from './middleware/error-handler'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Better Papers API is running' })
})

app.use('/api/papers', papersRouter)

app.use(errorHandler)

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`)
})
