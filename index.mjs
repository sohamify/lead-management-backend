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

// middlewares setup
app.use(cors({
  origin: 'https://lead-management-frontend-sage.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(cookieParser());

// mongodb connection
connectDB();

// routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));