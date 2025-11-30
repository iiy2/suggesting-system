import { Router, Request, Response } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  loginRateLimiter,
  registerRateLimiter
} from '../middleware/rateLimiter.js';
import {
  validate,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema
} from '../middleware/validator.js';
import type { ApiResponse } from '../types/index.js';

const router = Router();

// Public routes
router.post(
  '/register',
  registerRateLimiter,
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  loginRateLimiter,
  validate(loginSchema),
  authController.login
);

// Protected routes (require authentication)
router.post('/logout', authenticate, authController.logout);

router.get('/profile', authenticate, authController.getProfile);

router.put(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  authController.updateProfile
);

router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

// Admin routes
router.get(
  '/admin/users',
  authenticate,
  authorize('admin'),
  async (req: Request, res: Response<ApiResponse>) => {
    // TODO: Implement admin user list
    res.status(200).json({
      success: true,
      message: 'Admin users list endpoint'
    });
  }
);

export default router;
