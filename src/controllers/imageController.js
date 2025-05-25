import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import fs from 'fs/promises';
import path from 'path';
import { asyncHandler } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

// Upload images to a report
export const uploadImages = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const companyId = req.company.id;
  
  // Check if report exists and belongs to the company
  const report = await prisma.report.findFirst({
    where: {
      id: reportId,
      companyId,
    },
  });
  
  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found',
    });
  }
  
  // Get uploaded files
  const files = req.files;
  
  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded',
    });
  }
  
  // Save image information to database
  const savedImages = await Promise.all(
    files.map(async (file) => {
      const image = await prisma.reportImage.create({
        data: {
          filename: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
          reportId,
        },
      });
      
      return {
        ...image,
        url: `/uploads/${path.basename(file.path)}`,
      };
    })
  );
  
  res.status(201).json({
    success: true,
    data: savedImages,
    message: `${savedImages.length} images uploaded successfully`,
  });
});

// Get all images for a report
export const getReportImages = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const companyId = req.company.id;
  
  // Check if report exists and belongs to the company
  const report = await prisma.report.findFirst({
    where: {
      id: reportId,
      companyId,
    },
  });
  
  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found',
    });
  }
  
  // Get images
  const images = await prisma.reportImage.findMany({
    where: { reportId },
  });
  
  // Transform image paths to URLs
  const imagesWithUrls = images.map(image => ({
    ...image,
    url: `/uploads/${path.basename(image.path)}`,
  }));
  
  res.status(200).json({
    success: true,
    data: imagesWithUrls,
  });
});

// Delete an image
export const deleteImage = asyncHandler(async (req, res) => {
  const { imageId } = req.params;
  const companyId = req.company.id;
  
  // Find image and check if it belongs to a report owned by the company
  const image = await prisma.reportImage.findFirst({
    where: {
      id: imageId,
      report: {
        companyId,
      },
    },
    include: {
      report: true,
    },
  });
  
  if (!image) {
    return res.status(404).json({
      success: false,
      message: 'Image not found',
    });
  }
  
  // Delete image file
  try {
    await fs.unlink(image.path);
  } catch (error) {
    console.error('Error deleting image file:', error);
    // Continue with deletion from database even if file deletion fails
  }
  
  // Delete from database
  await prisma.reportImage.delete({
    where: { id: imageId },
  });
  
  res.status(200).json({
    success: true,
    message: 'Image deleted successfully',
  });
});