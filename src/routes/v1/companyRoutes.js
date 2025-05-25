import express from 'express';
import {
  getCompanyInfo,
  getInspectors,
  getDepartments,
} from '../../controllers/companyController.js';

const router = express.Router();

/**
 * @swagger
 * /company:
 *   get:
 *     summary: Get company information
 *     tags: [Company]
 *     responses:
 *       200:
 *         description: Company information
 */
router.get('/', getCompanyInfo);

/**
 * @swagger
 * /company/inspectors:
 *   get:
 *     summary: Get all inspectors for the company
 *     tags: [Company]
 *     responses:
 *       200:
 *         description: List of inspectors
 */
router.get('/inspectors', getInspectors);

/**
 * @swagger
 * /company/departments:
 *   get:
 *     summary: Get all departments for the company
 *     tags: [Company]
 *     responses:
 *       200:
 *         description: List of departments
 */
router.get('/departments', getDepartments);

export default router;