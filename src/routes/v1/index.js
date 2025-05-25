import express from 'express';
import reportRoutes from './reportRoutes.js';
import companyRoutes from './companyRoutes.js';
import { validateApiToken } from '../../middleware/apiToken.js';

const router = express.Router();

// Apply API token middleware to all routes
router.use(validateApiToken);

// Mount route groups
router.use('/reports', reportRoutes);
router.use('/company', companyRoutes);

export default router;