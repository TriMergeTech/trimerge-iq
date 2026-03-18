import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

export const login = (req: Request, res: Response): void => {
  const { username, password } = req.body;

  // Mock Authentication - In a real app, you would verify against a database
  if (username === 'admin' && password === 'password') {
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key';
    const token = jwt.sign({ username, role: 'admin' }, secret, { expiresIn: '1h' });

    logger.info(`User ${username} logged in successfully`);
    res.status(200).json({ token });
  } else {
    logger.warn(`Failed login attempt for username: ${username}`);
    res.status(401).json({ error: 'Invalid credentials' });
  }
};