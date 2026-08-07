import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';

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
    return prisma.user.findUnique({
      where: { email },
    });
  }
 
  /**
   * Retrieves a User from the database by user ID.
   */
  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
  }

  /**
   * Registers a new User and their face embeddings inside a database transaction.
   */
  static async createUser(name: string, email: string, passwordHash: string, embeddings: number[][]) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });

      await tx.faceEmbedding.createMany({
        data: embeddings.map((emb) => ({
          userId: user.id,
          embedding: JSON.stringify(emb),
        })),
      });

      return user;
    });
  }
}
