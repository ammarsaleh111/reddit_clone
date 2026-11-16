import 'dotenv/config'

const port = Number(process.env.PORT ?? 5000)
const mongodbUri = process.env.MONGODB_URI

if (!mongodbUri) {
  throw new Error('MONGODB_URI is required')
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port,
  mongodbUri,
}
