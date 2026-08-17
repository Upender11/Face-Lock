import mongoose from 'mongoose';

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  const MONGODB_URI = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/facelock';

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully via Mongoose');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

// FaceEmbedding Schema
const FaceEmbeddingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  embedding: { type: String, required: true }, // Serialized JSON string of the 512-dim float array
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
export const FaceEmbedding = mongoose.model('FaceEmbedding', FaceEmbeddingSchema);

