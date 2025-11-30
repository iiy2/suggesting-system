import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { redisClient } from '../config/redis.js';
import logger from '../utils/logger.js';
import type { AuthRequest, UserPayload, ApiResponse, UserRole } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify JWT token
export const authenticate = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided'
      });
      return;
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;

    // Check if session exists in Redis
    const session = await redisClient.get(`session:${decoded.id}`);
    if (!session) {
      res.status(401).json({
        success: false,
        message: 'Session expired or invalid'
      });
      return;
    }

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired'
      });
      return;
    }
    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Authorization middleware - check user role
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions'
      });
      return;
    }

    next();
  };
};
