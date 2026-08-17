import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import { connectDB } from './lib/mongoose';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Trust proxy header when running behind Vercel reverse proxy gateways
if (process.env.VERCEL === '1') {
  app.set('trust proxy', 1);
}

// --------------------------------------------------
// Rate limiting for authentication endpoints
// --------------------------------------------------

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message:
      'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// --------------------------------------------------
// CORS
// --------------------------------------------------

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://face-lock-amber.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(cookieParser());

app.use('/api/auth', authLimiter);

// Face images are sent as base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --------------------------------------------------
// Database connection
// --------------------------------------------------

connectDB()
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error);
  });

// --------------------------------------------------
// Routes
// --------------------------------------------------

app.use('/api', authRoutes);

// --------------------------------------------------
// Health check
// --------------------------------------------------

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'node-backend',
  });
});

// --------------------------------------------------
// Local development server
// --------------------------------------------------

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Node backend running on port ${PORT}`);
  });
}

// --------------------------------------------------
// Vercel serverless export
// --------------------------------------------------

export default app;