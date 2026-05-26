import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { protect } from '../controllers/authController.js';

const router = express.Router();

// Require user login for payments
router.use(protect);

router.post('/process-stripe', paymentController.processStripePayment);
router.post('/process-paypal', paymentController.processPayPalPayment);

export default router;
