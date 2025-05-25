import { body, param, query, validationResult } from 'express-validator';

// Validation result handler
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array(),
    });
  }
  next();
};

// Report validation rules
export const reportValidationRules = [
  body('inspectionDate')
    .notEmpty()
    .withMessage('Inspection date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('inspectorId')
    .notEmpty()
    .withMessage('Inspector ID is required'),
  
  body('departmentId')
    .notEmpty()
    .withMessage('Department ID is required'),
  
  body('customer.name')
    .notEmpty()
    .withMessage('Customer name is required'),
  
  body('customer.address')
    .notEmpty()
    .withMessage('Customer address is required'),
  
  body('customer.city')
    .notEmpty()
    .withMessage('Customer city is required'),
  
  body('customer.zipCode')
    .notEmpty()
    .withMessage('Customer ZIP code is required'),
  
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string'),
];

// Report ID parameter validation
export const reportIdParamValidation = [
  param('id')
    .notEmpty()
    .withMessage('Report ID is required')
    .isUUID()
    .withMessage('Invalid report ID format'),
];

// Report code parameter validation
export const reportCodeParamValidation = [
  param('code')
    .notEmpty()
    .withMessage('Report code is required'),
];

// Pagination validation
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];