// middleware/authMiddleware.mjs
import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
  console.log('Protect middleware - Cookies:', req.cookies); // Log all cookies
  const token = req.cookies.jwt;

  if (!token) {
    console.log('No token found in cookies');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    console.log('Verifying token:', token.substring(0, 10) + '...'); // Log first 10 chars for security
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId;
    console.log('Token verified, userId:', req.user);
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export default protect;