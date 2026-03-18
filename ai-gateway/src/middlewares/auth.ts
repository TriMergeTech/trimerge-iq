import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

// Extend the Express Request object to include our decoded user payload
declare global {
  namespace Express {
    interface Request {
      user?: string | jwt.JwtPayload;
    }
  }
}

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key';

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        logger.warn(`JWT verification failed: ${err.message}`);
        res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
        return;
      }
      req.user = decoded;
      next();
    });
  } else {
    logger.warn('Unauthorized access attempt: No token provided');
    res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
};