import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { FaceService } from '../services/face.service';
import { EmailService } from '../services/email.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// Validation Schemas
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  images: z.array(z.string()).min(5, 'At least 5 face scans are required').max(10, 'At most 10 face scans are allowed'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const faceLoginSchema = z.object({
  image: z.string().min(1, 'Image is required'),
});

const SIMILARITY_THRESHOLD = parseFloat(process.env.FACE_SIMILARITY_THRESHOLD || '0.72');

/**
 * Registers a new user.
 * Expects name, email, password, and 5-10 base64 face scans.
 */
export async function register(req: Request, res: Response) {
  try {
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const { name, email, password, images } = validationResult.data;

    // Check if user already exists
    const existingUser = await AuthService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Call AI Service in parallel for all images to generate embeddings
    let embeddings: number[][];
    try {
      embeddings = await Promise.all(
        images.map((img) => FaceService.generateEmbedding(img))
      );
    } catch (err: any) {
      return res.status(400).json({
        message: `Registration failed during face scan processing: ${err.message}. Please try again with clear lighting.`,
      });
    }

    // Check if the face is already registered under another account
    const allEmbeddings = await FaceService.getAllFaceEmbeddings();
    if (allEmbeddings.length > 0) {
      const candidates = allEmbeddings.map((item) => ({
        id: item.userId,
        embedding: item.embedding,
      }));
      const threshold = SIMILARITY_THRESHOLD;
      const verification = await FaceService.verifyFace(embeddings[0], candidates, threshold);

      if (verification.match) {
        return res.status(400).json({
          message: 'Registration failed: This face is already registered under another account.',
        });
      }
    }

    // Hash the password using bcryptjs before storing
    const passwordHash = await AuthService.hashPassword(password);

    // Save the user and face embeddings inside database transaction
    const newUser = await AuthService.createUser(name, email, passwordHash, embeddings);

    // Send welcome email asynchronously (non-blocking)
    EmailService.sendWelcomeEmail(name, email).catch((err) => {
      console.error('[REGISTRATION ERROR] Welcome email promise rejected:', err);
    });

    return res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error: any) {
    console.error('Error during registration:', error);
    return res.status(500).json({ message: 'Internal server error during registration' });
  }
}

/**
 * Logs in a user using Email + Password.
 */
export async function login(req: Request, res: Response) {
  try {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await AuthService.getUserByEmail(email);
    if (!user) {
      // Return generic authentication error (do not reveal if email or password was incorrect)
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password using bcryptjs
    const isPasswordValid = await AuthService.comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      // Return generic authentication error (do not reveal if email or password was incorrect)
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = AuthService.generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    // Set JWT as HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal server error during login' });
  }
}

/**
 * Logs in a user using 1:N face verification.
 * Expects a base64 live image.
 */
export async function faceLogin(req: Request, res: Response) {
  try {
    const validationResult = faceLoginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const { image } = validationResult.data;

    // Generate embedding for the live capture
    let liveEmbedding: number[];
    try {
      liveEmbedding = await FaceService.generateEmbedding(image);
    } catch (err: any) {
      return res.status(400).json({ message: `Face generation error: ${err.message}` });
    }

    // Fetch all stored embeddings from SQLite
    const allEmbeddings = await FaceService.getAllFaceEmbeddings();
    if (allEmbeddings.length === 0) {
      return res.status(401).json({ message: 'Face not recognized' });
    }

    // Verify face against candidates (using similarity threshold from environment)
    const candidates = allEmbeddings.map((item) => ({
      id: item.userId,
      embedding: item.embedding,
    }));
    const threshold = SIMILARITY_THRESHOLD;
    const verification = await FaceService.verifyFace(liveEmbedding, candidates, threshold);

    if (!verification.match || !verification.matchedId) {
      return res.status(401).json({ message: 'Face not recognized' });
    }

    // Fetch matching user info
    const user = await AuthService.getUserById(verification.matchedId);
    if (!user) {
      return res.status(401).json({ message: 'User matching this face no longer exists' });
    }

    // Generate JWT token
    const token = AuthService.generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    // Set JWT as HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Error during face login:', error);
    return res.status(500).json({ message: 'Internal server error during face login' });
  }
}

/**
 * Returns authenticated user profile info.
 */
export async function profile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await AuthService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Simple logout endpoint.
 */
export async function logout(req: Request, res: Response) {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logged out successfully' });
}
