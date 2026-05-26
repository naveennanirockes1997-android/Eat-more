import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// All order routes require authentication
router.use(protect);

// Customer routes
router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.patch('/:id/cancel', orderController.cancelOrder);

// Admin-only order management routes
router.use(restrictTo('admin'));

router.route('/')
  .get(orderController.getAllOrders);

router.route('/:id')
  .delete(orderController.deleteOrder);

router.patch('/:id/status', orderController.updateOrderStatus);

export default router;
