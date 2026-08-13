import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, FaceEmbedding } from '../lib/mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_987654321_face_recognition';

export interface UserPayload {
  id: string;
  name: string;
  email: string;
}

/**
 * Service to manage authentication, JWT generation, and User database lookups.
 */
export class AuthService {
  /**
   * Hashes a plain-text password using bcryptjs.
   */
  static async hashPassword(password: string): Promise<string> {
    return bcryptjs.hash(password, 10);
  }
 
  /**
   * Compares a plain-text password against a hashed password.
   */
  static async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(password, hash);
  }

  /**
   * Generates a signed JWT token valid for 2 hours.
   */
  static generateToken(payload: UserPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
  }

  /**
   * Retrieves a User from the database by email address.
   */
  static async getUserByEmail(email: string) {
    const user = await User.findOne({ email });
    if (!user) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
    };
  }
 
  /**
   * Retrieves a User from the database by user ID.
   */
  static async getUserById(id: string) {
    const user = await User.findById(id);
    if (!user) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  /**
   * Registers a new User and their face embeddings inside a database transaction.
   */
  static async createUser(name: string, email: string, passwordHash: string, embeddings: number[][]) {
    const user = await User.create({ name, email, passwordHash });
    try {
      const faceEmbeddings = embeddings.map((emb) => ({
        userId: user._id,
        embedding: JSON.stringify(emb),
      }));
      await FaceEmbedding.insertMany(faceEmbeddings);
    } catch (err) {
      // Rollback user creation manually (works on standalone MongoDB installs too)
      await User.findByIdAndDelete(user._id);
      throw err;
    }
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
