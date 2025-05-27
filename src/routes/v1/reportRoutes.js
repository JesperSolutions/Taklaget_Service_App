import express from 'express';
import {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
} from '../../controllers/reportController.js';
import {
  createFinding,
  deleteFinding,
} from '../../controllers/findingController.js';
import {
  uploadImages,
  deleteImage,
} from '../../controllers/imageController.js';
import upload, { handleMulterError } from '../../middleware/upload.js';

const router = express.Router();

// Report routes
router.get('/', getReports);
router.get('/:id', getReportById);
router.post('/', createReport);
router.put('/:id', updateReport);
router.delete('/:id', deleteReport);

// Finding routes
router.post('/:reportId/findings', createFinding);
router.delete('/:reportId/findings/:findingId', deleteFinding);

// Image routes
router.post(
  '/:findingId/images',
  upload.array('images', 10),
  handleMulterError,
  uploadImages
);
router.delete('/images/:imageId', deleteImage);

export default router;