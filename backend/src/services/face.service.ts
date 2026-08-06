import axios from 'axios';
import prisma from '../utils/db';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 8000, // 8-second timeout to prevent connection starvation
});

export interface VerifyFaceCandidate {
  id: string;
  embedding: number[];
}

export interface VerifyFaceResponse {
  match: boolean;
  matchedId: string | null;
  score: number;
}

/**
 * Service to communicate with the Python AI microservice.
 */
export class FaceService {
  /**
   * Sends a base64 encoded face image to the AI service to generate its embedding vector.
   */
  static async generateEmbedding(base64Image: string): Promise<number[]> {
    try {
      const response = await aiClient.post('/generate-embedding', {
        image: base64Image,
      });
      return response.data.embedding;
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('AI Service is currently unavailable');
    }
  }
  
  /**
   * Compares a live embedding against a list of candidates using the AI service.
   */
  static async verifyFace(
    liveEmbedding: number[],
    candidates: VerifyFaceCandidate[],
    threshold = 0.72
  ): Promise<VerifyFaceResponse> {
    try {
      const response = await aiClient.post('/verify-face', {
        live_embedding: liveEmbedding,
        candidates,
        threshold,
      });
      return {
        match: response.data.match,
        matchedId: response.data.matched_id,
        score: response.data.score,
      };
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('AI Service is currently unavailable');
    }
  }

  /**
   * Fetches all registered face embeddings from the database.
   */
  static async getAllFaceEmbeddings(): Promise<Array<{ userId: string; embedding: number[] }>> {
    const records = await prisma.faceEmbedding.findMany({
      select: {
        userId: true,
        embedding: true,
      },
    });

    return records.map((rec) => ({
      userId: rec.userId,
      embedding: JSON.parse(rec.embedding) as number[],
    }));
  }
}
