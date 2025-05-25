import express from 'express';
import {
  getReports,
  getReportById,
  getReportByCode,
  createReport,
  updateReport,
  deleteReport,
} from '../../controllers/reportController.js';
import {
  uploadImages,
  getReportImages,
  deleteImage,
} from '../../controllers/imageController.js';
import upload, { handleMulterError } from '../../middleware/upload.js';
import {
  validate,
  reportValidationRules,
  reportIdParamValidation,
  reportCodeParamValidation,
  paginationValidation,
} from '../../utils/validation.js';

const router = express.Router();

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Get all reports
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of reports
 */
router.get('/', paginationValidation, validate, getReports);

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Get report by ID
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report details
 *       404:
 *         description: Report not found
 */
router.get('/:id', reportIdParamValidation, validate, getReportById);

/**
 * @swagger
 * /reports/code/{code}:
 *   get:
 *     summary: Get report by code
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Report code
 *     responses:
 *       200:
 *         description: Report details
 *       404:
 *         description: Report not found
 */
router.get('/code/:code', reportCodeParamValidation, validate, getReportByCode);

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Create a new report
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inspectionDate
 *               - inspectorId
 *               - departmentId
 *               - customer
 *             properties:
 *               inspectionDate:
 *                 type: string
 *                 format: date-time
 *               inspectorId:
 *                 type: string
 *                 format: uuid
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *               notes:
 *                 type: string
 *               customer:
 *                 type: object
 *                 required:
 *                   - name
 *                   - address
 *                   - city
 *                   - zipCode
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *     responses:
 *       201:
 *         description: Report created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', reportValidationRules, validate, createReport);

/**
 * @swagger
 * /reports/{id}:
 *   put:
 *     summary: Update a report
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inspectionDate:
 *                 type: string
 *                 format: date-time
 *               inspectorId:
 *                 type: string
 *                 format: uuid
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, SUBMITTED, APPROVED, REJECTED]
 *               customer:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *     responses:
 *       200:
 *         description: Report updated successfully
 *       404:
 *         description: Report not found
 */
router.put('/:id', reportIdParamValidation, validate, updateReport);

/**
 * @swagger
 * /reports/{id}:
 *   delete:
 *     summary: Delete a report
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *       404:
 *         description: Report not found
 */
router.delete('/:id', reportIdParamValidation, validate, deleteReport);

/**
 * @swagger
 * /reports/{reportId}/images:
 *   post:
 *     summary: Upload images to a report
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Report ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Images uploaded successfully
 *       404:
 *         description: Report not found
 */
router.post(
  '/:reportId/images',
  upload.array('images', 10),
  handleMulterError,
  uploadImages
);

/**
 * @swagger
 * /reports/{reportId}/images:
 *   get:
 *     summary: Get all images for a report
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Report ID
 *     responses:
 *       200:
 *         description: List of images
 *       404:
 *         description: Report not found
 */
router.get('/:reportId/images', getReportImages);

/**
 * @swagger
 * /reports/images/{imageId}:
 *   delete:
 *     summary: Delete an image
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Image ID
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       404:
 *         description: Image not found
 */
router.delete('/images/:imageId', deleteImage);

export default router;