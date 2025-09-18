import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.mjs';
import authRoutes from './routes/authRoutes.mjs';
import leadRoutes from './routes/leadRoutes.mjs';

// env variables
dotenv.config();

// Express app setup 
const app = express();

// Trust proxy (important for Render)
app.set('trust proxy', 1);

// Enhanced CORS configuration
app.use(cors({
  origin: [
    'https://lead-management-frontend-lime.vercel.app',
    'http://localhost:3000', // for development
    'http://localhost:5173', // for Vite dev server
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Cookie',
    'Set-Cookie',
    'Access-Control-Allow-Credentials'
  ],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

// Middleware setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Cookies received:', req.cookies);
  console.log('Authorization header:', req.headers.authorization);
  next();
});

// mongodb connection
connectDB();

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`CORS enabled for: https://lead-management-frontend-lime.vercel.app`);
});