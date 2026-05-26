import express from 'express';
import * as cartController from '../controllers/cartController.js';
import { protect } from '../controllers/authController.js';

const router = express.Router();

// All cart routes require user login
router.use(protect);

router.route('/')
  .get(cartController.getCart)
  .post(cartController.addToCart)
  .delete(cartController.clearCart);

router.route('/:itemID')
  .delete(cartController.removeFromCart)
  .patch(cartController.updateCartQuantity);

export default router;
