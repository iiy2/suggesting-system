import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { redisClient } from '../config/redis.js';
import logger from '../utils/logger.js';
import type { AuthRequest, RegisterDTO, LoginDTO, UpdateProfileDTO, ChangePasswordDTO, ApiResponse, UserPayload } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Register new user
export const register = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName }: RegisterDTO = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Create new user
    const user = await User.create({
      email,
      passwordHash: password,
      firstName,
      lastName,
      role: 'user',
      isActive: true
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role } as UserPayload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

// Login user
export const login = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password }: LoginDTO = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role } as UserPayload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Store session in Redis
    await redisClient.setEx(
      `session:${user.id}`,
      24 * 60 * 60, // 24 hours
      JSON.stringify({ userId: user.id, email: user.email, loginAt: new Date() })
    );

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

// Logout user
export const logout = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    // Remove session from Redis
    await redisClient.del(`session:${userId}`);

    logger.info(`User logged out: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

// Get current user profile
export const getProfile = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user: user.toJSON() }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
};

// Update user profile
export const updateProfile = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { firstName, lastName, email }: UpdateProfileDTO = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Update fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined && email !== user.email) {
      // Check if new email is already taken
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'Email already in use'
        });
        return;
      }
      user.email = email;
    }

    await user.save();

    logger.info(`User profile updated: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: user.toJSON() }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
};

// Change password
export const changePassword = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword }: ChangePasswordDTO = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }

    // Update password
    user.passwordHash = newPassword;
    await user.save();

    // Invalidate all sessions
    await redisClient.del(`session:${userId}`);

    logger.info(`Password changed for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    next(error);
  }
};
