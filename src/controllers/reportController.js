import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { asyncHandler } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

// Generate a unique report code
const generateReportCode = (company, department) => {
  const timestamp = Date.now().toString().slice(-6);
  return `${company.code}-${department.code}-${timestamp}`;
};

// Get all reports (with pagination)
export const getReports = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  
  // Get company from request (set by apiToken middleware)
  const companyId = req.company.id;
  
  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where: { companyId },
      include: {
        inspector: true,
        department: true,
        customer: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
          },
        },
        findings: {
          include: {
            images: true,
          },
        },
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.report.count({ where: { companyId } }),
  ]);
  
  // Transform image paths to URLs
  const reportsWithImageUrls = reports.map(report => ({
    ...report,
    findings: report.findings.map(finding => ({
      ...finding,
      images: finding.images.map(image => ({
        ...image,
        url: `/uploads/${path.basename(image.path)}`,
      })),
    })),
  }));
  
  res.status(200).json({
    success: true,
    data: {
      reports: reportsWithImageUrls,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Get report by ID
export const getReportById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const companyId = req.company.id;
  
  const report = await prisma.report.findFirst({
    where: {
      id,
      companyId,
    },
    include: {
      inspector: true,
      department: true,
      customer: true,
      findings: {
        include: {
          images: true,
        },
      },
    },
  });
  
  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found',
    });
  }
  
  // Transform image paths to URLs
  const reportWithImageUrls = {
    ...report,
    findings: report.findings.map(finding => ({
      ...finding,
      images: finding.images.map(image => ({
        ...image,
        url: `/uploads/${path.basename(image.path)}`,
      })),
    })),
  };
  
  res.status(200).json({
    success: true,
    data: reportWithImageUrls,
  });
});

// Create a new report
export const createReport = asyncHandler(async (req, res) => {
  const {
    inspectionDate,
    inspectorId,
    departmentId,
    notes,
    customer,
  } = req.body;
  
  const companyId = req.company.id;
  
  // Validate inspector belongs to company
  const inspector = await prisma.inspector.findFirst({
    where: {
      id: inspectorId,
      companyId,
    },
  });
  
  if (!inspector) {
    return res.status(400).json({
      success: false,
      message: 'Invalid inspector ID',
    });
  }
  
  // Validate department belongs to company
  const department = await prisma.department.findFirst({
    where: {
      id: departmentId,
      companyId,
    },
  });
  
  if (!department) {
    return res.status(400).json({
      success: false,
      message: 'Invalid department ID',
    });
  }
  
  // Begin transaction
  const result = await prisma.$transaction(async (prisma) => {
    // Create or update customer
    let customerId;
    
    if (customer.id) {
      // Update existing customer
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: customer.name,
          address: customer.address,
          city: customer.city,
          state: customer.state,
          zipCode: customer.zipCode,
          phone: customer.phone,
          email: customer.email,
        },
      });
      customerId = customer.id;
    } else {
      // Create new customer
      const newCustomer = await prisma.customer.create({
        data: {
          name: customer.name,
          address: customer.address,
          city: customer.city,
          state: customer.state,
          zipCode: customer.zipCode,
          phone: customer.phone,
          email: customer.email,
        },
      });
      customerId = newCustomer.id;
    }
    
    // Generate report code
    const reportCode = generateReportCode(req.company, department);
    
    // Create report
    const report = await prisma.report.create({
      data: {
        reportCode,
        inspectionDate: new Date(inspectionDate),
        notes,
        inspectorId,
        companyId,
        departmentId,
        customerId,
        status: 'DRAFT',
      },
      include: {
        inspector: true,
        department: true,
        customer: true,
        findings: true,
      },
    });
    
    return report;
  });
  
  res.status(201).json({
    success: true,
    data: result,
    message: 'Report created successfully',
  });
});

// Update a report
export const updateReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    inspectionDate,
    inspectorId,
    departmentId,
    notes,
    status,
    customer,
  } = req.body;
  
  const companyId = req.company.id;
  
  // Check if report exists and belongs to the company
  const existingReport = await prisma.report.findFirst({
    where: {
      id,
      companyId,
    },
  });
  
  if (!existingReport) {
    return res.status(404).json({
      success: false,
      message: 'Report not found',
    });
  }
  
  // Begin transaction
  const result = await prisma.$transaction(async (prisma) => {
    // Update customer if provided
    if (customer) {
      await prisma.customer.update({
        where: { id: existingReport.customerId },
        data: {
          name: customer.name,
          address: customer.address,
          city: customer.city,
          state: customer.state,
          zipCode: customer.zipCode,
          phone: customer.phone,
          email: customer.email,
        },
      });
    }
    
    // Update report
    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        inspectionDate: inspectionDate ? new Date(inspectionDate) : undefined,
        notes,
        status: status || undefined,
        inspectorId: inspectorId || undefined,
        departmentId: departmentId || undefined,
      },
      include: {
        inspector: true,
        department: true,
        customer: true,
        findings: {
          include: {
            images: true,
          },
        },
      },
    });
    
    return updatedReport;
  });
  
  // Transform image paths to URLs
  const reportWithImageUrls = {
    ...result,
    findings: result.findings.map(finding => ({
      ...finding,
      images: finding.images.map(image => ({
        ...image,
        url: `/uploads/${path.basename(image.path)}`,
      })),
    })),
  };
  
  res.status(200).json({
    success: true,
    data: reportWithImageUrls,
    message: 'Report updated successfully',
  });
});

// Delete a report
export const deleteReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const companyId = req.company.id;
  
  // Check if report exists and belongs to the company
  const existingReport = await prisma.report.findFirst({
    where: {
      id,
      companyId,
    },
  });
  
  if (!existingReport) {
    return res.status(404).json({
      success: false,
      message: 'Report not found',
    });
  }
  
  // Delete report (cascade will delete findings and images)
  await prisma.report.delete({
    where: { id },
  });
  
  res.status(200).json({
    success: true,
    message: 'Report deleted successfully',
  });
});