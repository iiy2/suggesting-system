import { Request, Response, NextFunction } from 'express';
import { ValidationError, UniqueConstraintError, DatabaseError } from 'sequelize';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import logger from '../utils/logger.js';
import type { ApiResponse } from '../types/index.js';

// Error handler middleware
const errorHandler = (
  err: Error,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  // Sequelize validation errors
  if (err instanceof ValidationError) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map(e => ({
        field: e.path || 'unknown',
        message: e.message
      }))
    });
    return;
  }

  // Sequelize unique constraint errors
  if (err instanceof UniqueConstraintError) {
    res.status(409).json({
      success: false,
      message: 'Resource already exists',
      errors: err.errors.map(e => ({
        field: e.path || 'unknown',
        message: e.message
      }))
    });
    return;
  }

  // Sequelize database errors
  if (err instanceof DatabaseError) {
    res.status(500).json({
      success: false,
      message: 'Database error occurred'
    });
    return;
  }

  // JWT errors
  if (err instanceof JsonWebTokenError) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
    return;
  }

  if (err instanceof TokenExpiredError) {
    res.status(401).json({
      success: false,
      message: 'Token expired'
    });
    return;
  }

  // Default error
  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { data: { stack: err.stack } })
  });
};

export default errorHandler;
