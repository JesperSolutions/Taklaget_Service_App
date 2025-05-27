import express from 'express';
import reportRoutes from './reportRoutes.js';
import companyRoutes from './companyRoutes.js';
import authRoutes from './authRoutes.js';
import { validateApiToken } from '../../middleware/apiToken.js';

const router = express.Router();

// Public auth routes
router.use('/auth', authRoutes);

// Protected routes
router.use(validateApiToken);
router.use('/reports', reportRoutes);
router.use('/company', companyRoutes);

export default router;