import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { asyncHandler } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

// Get company info
export const getCompanyInfo = asyncHandler(async (req, res) => {
  const companyId = req.company.id;
  
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      parentGroup: true,
      departments: true,
    },
  });
  
  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found',
    });
  }
  
  res.status(200).json({
    success: true,
    data: company,
  });
});

// Get all inspectors for the company
export const getInspectors = asyncHandler(async (req, res) => {
  const companyId = req.company.id;
  
  const inspectors = await prisma.inspector.findMany({
    where: { companyId },
  });
  
  res.status(200).json({
    success: true,
    data: inspectors,
  });
});

// Get all departments for the company
export const getDepartments = asyncHandler(async (req, res) => {
  const companyId = req.company.id;
  
  const departments = await prisma.department.findMany({
    where: { companyId },
  });
  
  res.status(200).json({
    success: true,
    data: departments,
  });
});