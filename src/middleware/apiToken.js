import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

/**
 * Middleware to validate API token and identify the company and inspector
 */
export const validateApiToken = async (req, res, next) => {
  try {
    const apiToken = req.headers['x-api-token'];

    if (!apiToken) {
      return res.status(401).json({
        success: false,
        message: 'API token is required',
      });
    }

    // In a real application, you would validate the token against a database
    // or use JWT verification. This is a simplified example.
    
    // For the sake of this example, we'll parse the token to extract company and inspector IDs
    // Format: companyCode:inspectorCode
    const [companyCode, inspectorCode] = apiToken.split(':');

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API token format',
      });
    }

    // Fetch company by code
    const company = await prisma.company.findUnique({
      where: { code: companyCode },
    });

    if (!company) {
      return res.status(401).json({
        success: false,
        message: 'Invalid company code',
      });
    }

    // Add company to request object
    req.company = company;

    // If inspector code is provided, fetch inspector
    if (inspectorCode) {
      const inspector = await prisma.inspector.findFirst({
        where: {
          code: inspectorCode,
          companyId: company.id,
        },
      });

      if (inspector) {
        req.inspector = inspector;
      }
    }

    next();
  } catch (error) {
    console.error('Error validating API token:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating API token',
    });
  }
};