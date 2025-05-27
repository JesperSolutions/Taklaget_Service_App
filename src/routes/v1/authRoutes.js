import express from 'express';
import {
  register,
  login,
  getCurrentUser,
} from '../../controllers/authController.js';
import { validateApiToken } from '../../middleware/apiToken.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', validateApiToken, getCurrentUser);

export default router;