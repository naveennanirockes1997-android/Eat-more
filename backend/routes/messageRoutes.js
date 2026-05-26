import express from 'express';
import * as messageController from '../controllers/messageController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// Public route for users to submit messages (reviews)
router.post('/', messageController.submitMessage);

// Public route to read reviews on the frontend
router.get('/', messageController.getMessages);

// Admin-only routes to moderate reviews
router.use(protect, restrictTo('admin'));
router.patch('/:id', messageController.updateMessage);
router.delete('/:id', messageController.deleteMessage);

export default router;
