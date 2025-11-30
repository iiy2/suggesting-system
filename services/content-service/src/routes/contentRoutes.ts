import { Router } from 'express';
import {
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent
} from '../controllers/contentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  validateCreateContent,
  validateUpdateContent
} from '../middleware/validator.js';

const router = Router();

// Public routes (with optional authentication for personalized results)
router.get('/', getAllContent);
router.get('/:id', getContentById);

// Protected routes (require authentication)
router.post(
  '/',
  authenticate,
  authorize('admin', 'moderator'),
  validateCreateContent,
  createContent
);

router.put(
  '/:id',
  authenticate,
  validateUpdateContent,
  updateContent
);

router.delete(
  '/:id',
  authenticate,
  deleteContent
);

export default router;
