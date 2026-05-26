import express from 'express';
import * as settingsController from '../controllers/settingsController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// Public route to fetch settings (for frontend About/Contact sections)
router.get('/', settingsController.getSettings);

// Admin-only route to update settings
router.use(protect, restrictTo('admin'));
router.patch('/', settingsController.updateSettings);

export default router;
