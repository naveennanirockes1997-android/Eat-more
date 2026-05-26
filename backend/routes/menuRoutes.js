import express from 'express';
import * as menuController from '../controllers/menuController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// Public route to view menu
router.get('/', menuController.getMenuItems);

// Protected admin routes for CRUD operations
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', menuController.createMenuItem);

router.route('/:id')
  .patch(menuController.updateMenuItem)
  .delete(menuController.deleteMenuItem);

export default router;
