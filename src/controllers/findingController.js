import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { asyncHandler } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

// Create a new finding
export const createFinding = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { title, description, severity } = req.body;
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

  const finding = await prisma.finding.create({
    data: {
      title,
      description,
      severity,
      reportId,
    },
    include: {
      images: true,
    },
  });

  res.status(201).json({
    success: true,
    data: finding,
    message: 'Finding created successfully',
  });
});

// Delete a finding
export const deleteFinding = asyncHandler(async (req, res) => {
  const { reportId, findingId } = req.params;
  const companyId = req.company.id;

  // Check if report and finding exist and belong to the company
  const finding = await prisma.finding.findFirst({
    where: {
      id: findingId,
      report: {
        id: reportId,
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

  await prisma.finding.delete({
    where: { id: findingId },
  });

  res.status(200).json({
    success: true,
    message: 'Finding deleted successfully',
  });
});