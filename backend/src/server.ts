import express from 'express'
import { connectDatabase } from './config/database.js'
import { env } from './config/env.js'
import './models/index.js'

const app = express()
app.use(express.json())

async function startServer(): Promise<void> {
  await connectDatabase(env.mongodbUri)
  app.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`)
  })
}

startServer().catch((error: unknown) => {
  console.error('Failed to start server', error)
  process.exitCode = 1
})
