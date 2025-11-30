import { Response, NextFunction } from 'express';
import Joi from 'joi';
import type { AuthRequest, ApiResponse } from '../types/index.js';

// Validation schemas
const createContentSchema = Joi.object({
  title: Joi.string().min(3).max(500).required(),
  description: Joi.string().max(5000).optional(),
  contentType: Joi.string().valid('course', 'article', 'video', 'news').required(),
  category: Joi.string().max(100).optional(),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
  difficultyLevel: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
  durationMinutes: Joi.number().integer().min(0).max(10000).optional(),
  language: Joi.string().length(2).default('uk').optional(),
  isPublished: Joi.boolean().default(false).optional()
});

const updateContentSchema = Joi.object({
  title: Joi.string().min(3).max(500).optional(),
  description: Joi.string().max(5000).optional(),
  category: Joi.string().max(100).optional(),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
  difficultyLevel: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
  durationMinutes: Joi.number().integer().min(0).max(10000).optional(),
  language: Joi.string().length(2).optional(),
  isPublished: Joi.boolean().optional()
});

// Validate create content request
export const validateCreateContent = (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  const { error } = createContentSchema.validate(req.body, { abortEarly: false });

  if (error) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
    return;
  }

  next();
};

// Validate update content request
export const validateUpdateContent = (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  const { error } = updateContentSchema.validate(req.body, { abortEarly: false });

  if (error) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
    return;
  }

  next();
};
