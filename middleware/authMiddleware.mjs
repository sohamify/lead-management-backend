// middleware/authMiddleware.mjs
import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
  console.log('Protect middleware - Cookies:', req.cookies, 'Headers:', req.headers.authorization);
  let token;

  // Check cookies first (per assignment requirement)
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
    console.log('Token found in cookies:', token.substring(0, 10) + '...');
  }
  // Fallback to Authorization header (for Postman testing)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token found in Authorization header:', token.substring(0, 10) + '...');
  }

  if (!token) {
    console.log('No token found in cookies or headers');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    console.log('Verifying token:', token.substring(0, 10) + '...');
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