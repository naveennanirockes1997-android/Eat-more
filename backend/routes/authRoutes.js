import express from 'express';
import passport from 'passport';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword/:token', authController.resetPassword);

// Google OAuth routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), authController.googleOAuthSuccess);

// Protected routes (Available to any logged-in user)
router.get('/me', authController.protect, authController.getMe);
router.patch('/updateMe', authController.protect, authController.updateMe);
router.patch('/updateMyPassword', authController.protect, authController.updateMyPassword);

// Admin-only user management routes
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

router.route('/')
  .get(authController.getAllUsers);

router.route('/:id')
  .delete(authController.deleteUser);

router.patch('/:id/role', authController.updateUserRole);

export default router;
