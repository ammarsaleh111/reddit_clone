import mongoose from 'mongoose'

export async function connectDatabase(uri: string): Promise<void> {
  try{
    await mongoose.connect(uri)
    console.log(`MongoDB connected: ${mongoose.connection.name}`)
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    throw error
  }
}
