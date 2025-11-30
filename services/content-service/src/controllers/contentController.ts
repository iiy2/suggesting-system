import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import Content from '../models/Content.js';
import { redisClient } from '../config/redis.js';
import logger from '../utils/logger.js';
import type { AuthRequest, ApiResponse, ContentQueryParams } from '../types/index.js';

// Get all content with filters and pagination
export const getAllContent = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      contentType,
      category,
      difficulty,
      language,
      isPublished,
      search
    }: ContentQueryParams = req.query;

    // Build where clause
    const where: any = {};

    if (contentType) where.contentType = contentType;
    if (category) where.category = category;
    if (difficulty) where.difficultyLevel = difficulty;
    if (language) where.language = language;
    if (isPublished !== undefined) where.isPublished = isPublished === 'true';

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Calculate pagination
    const offset = (Number(page) - 1) * Number(limit);

    // Try cache first
    const cacheKey = `content:list:${JSON.stringify(where)}:${page}:${limit}`;
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      res.status(200).json(JSON.parse(cached));
      return;
    }

    // Fetch from database
    const { count, rows } = await Content.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    const response: ApiResponse = {
      success: true,
      data: { content: rows },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil(count / Number(limit))
      }
    };

    // Cache for 5 minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(response));

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get all content error:', error);
    next(error);
  }
};

// Get content by ID
export const getContentById = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const content = await Content.findByPk(id);

    if (!content) {
      res.status(404).json({
        success: false,
        message: 'Content not found'
      });
      return;
    }

    // Increment view count
    content.viewCount += 1;
    await content.save();

    res.status(200).json({
      success: true,
      data: { content }
    });
  } catch (error) {
    logger.error('Get content by ID error:', error);
    next(error);
  }
};

// Create new content
export const createContent = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      contentType,
      category,
      tags = [],
      difficultyLevel,
      durationMinutes,
      language = 'uk',
      isPublished = false
    } = req.body;

    const content = await Content.create({
      title,
      description,
      contentType,
      category,
      tags,
      authorId: req.user?.id,
      difficultyLevel,
      durationMinutes,
      language,
      isPublished,
      publishedAt: isPublished ? new Date() : undefined,
      viewCount: 0,
      rating: 0
    });

    // Invalidate cache
    const keys = await redisClient.keys('content:list:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    logger.info(`Content created: ${content.id}`);

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: { content }
    });
  } catch (error) {
    logger.error('Create content error:', error);
    next(error);
  }
};

// Update content
export const updateContent = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      tags,
      difficultyLevel,
      durationMinutes,
      language,
      isPublished
    } = req.body;

    const content = await Content.findByPk(id);

    if (!content) {
      res.status(404).json({
        success: false,
        message: 'Content not found'
      });
      return;
    }

    // Check permissions (only author or admin can update)
    if (content.authorId !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to update this content'
      });
      return;
    }

    // Update fields
    if (title !== undefined) content.title = title;
    if (description !== undefined) content.description = description;
    if (category !== undefined) content.category = category;
    if (tags !== undefined) content.tags = tags;
    if (difficultyLevel !== undefined) content.difficultyLevel = difficultyLevel;
    if (durationMinutes !== undefined) content.durationMinutes = durationMinutes;
    if (language !== undefined) content.language = language;
    if (isPublished !== undefined) {
      content.isPublished = isPublished;
      if (isPublished && !content.publishedAt) {
        content.publishedAt = new Date();
      }
    }

    await content.save();

    // Invalidate cache
    const keys = await redisClient.keys('content:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    logger.info(`Content updated: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Content updated successfully',
      data: { content }
    });
  } catch (error) {
    logger.error('Update content error:', error);
    next(error);
  }
};

// Delete content
export const deleteContent = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const content = await Content.findByPk(id);

    if (!content) {
      res.status(404).json({
        success: false,
        message: 'Content not found'
      });
      return;
    }

    // Check permissions (only author or admin can delete)
    if (content.authorId !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this content'
      });
      return;
    }

    await content.destroy();

    // Invalidate cache
    const keys = await redisClient.keys('content:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    logger.info(`Content deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    logger.error('Delete content error:', error);
    next(error);
  }
};
