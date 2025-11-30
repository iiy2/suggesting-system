import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';
import type { ApiResponse } from '../types/index.js';

interface CustomError extends Error {
  statusCode?: number;
  errors?: Array<{ field: string; message: string; }>;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors
  });
};

export default errorHandler;
