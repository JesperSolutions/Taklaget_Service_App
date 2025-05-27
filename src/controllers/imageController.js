import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import fs from 'fs/promises';
import path from 'path';
import { asyncHandler } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

// Upload images to a finding
export const uploadImages = asyncHandler(async (req, res) => {
  const { findingId } = req.params;
  const companyId = req.company.id;
  const { comment, severity } = req.body;
  
  // Check if finding exists and belongs to the company
  const finding = await prisma.finding.findFirst({
    where: {
      id: findingId,
      report: {
        companyId,
      },
    },
  });
  
  if (!finding) {
    return res.status(404).json({
      success: false,
      message: 'Finding not found',
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
          comment,
          severity,
          findingId,
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

// Delete an image
export const deleteImage = asyncHandler(async (req, res) => {
  const { imageId } = req.params;
  const companyId = req.company.id;
  
  // Find image and check if it belongs to a finding in a report owned by the company
  const image = await prisma.reportImage.findFirst({
    where: {
      id: imageId,
      finding: {
        report: {
          companyId,
        },
      },
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