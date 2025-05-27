import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/errorHandler.js';
import prisma from '../config/database.js';

// Register new company and admin
export const register = asyncHandler(async (req, res) => {
  const { companyName, companyCode, adminName, email, password } = req.body;

  try {
    // Check if company code already exists
    const existingCompany = await prisma.company.findUnique({
      where: { code: companyCode },
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Company code already exists',
      });
    }

    // Create parent group and company in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create parent group
      const parentGroup = await tx.parentGroup.create({
        data: {
          name: `${companyName} Group`,
          code: companyCode,
        },
      });

      // Create company
      const company = await tx.company.create({
        data: {
          name: companyName,
          code: companyCode,
          parentGroupId: parentGroup.id,
        },
      });

      // Create default departments
      await tx.department.createMany({
        data: [
          {
            name: 'Residential',
            code: 'RES',
            companyId: company.id,
          },
          {
            name: 'Commercial',
            code: 'COM',
            companyId: company.id,
          },
        ],
      });

      // Create default inspector
      await tx.inspector.create({
        data: {
          name: adminName,
          code: `INS-001-${companyCode}`,
          email: email,
          companyId: company.id,
        },
      });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create admin user
      const user = await tx.authUser.create({
        data: {
          email,
          passwordHash: hashedPassword,
          companyId: company.id,
          role: 'admin',
        },
      });

      return { company, user };
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        companyCode: result.company.code,
        email: result.user.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await prisma.authUser.findUnique({
      where: { email },
      include: {
        company: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        companyCode: user.company.code,
      },
      process.env.API_TOKEN_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
});

// Get current user
export const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    const user = await prisma.authUser.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        company: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information',
      error: error.message,
    });
  }
});