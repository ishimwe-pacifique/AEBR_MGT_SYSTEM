import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined in .env.local')

declare global {
  var _mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
}

let cached = global._mongooseCache ?? { conn: null, promise: null }
global._mongooseCache = cached

export async function connectDB() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      .then((m) => {
        console.log('✅ MongoDB connected')
        return m
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message)
        cached.promise = null
        throw err
      })
  }

  cached.conn = await cached.promise
  return cached.conn
}
