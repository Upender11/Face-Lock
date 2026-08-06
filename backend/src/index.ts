import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Enable CORS with credentials support (required for cookies)
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Read cookies
app.use(cookieParser());

// Limit requests on auth routes
app.use('/api/auth', authLimiter);

// Increase payload limits for receiving multiple base64 face images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routing
app.use('/api', authRoutes);

// Server check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'node-backend' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`Node backend running on port ${PORT}`);
});
