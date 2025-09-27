const { body, validationResult } = require('express-validator');

// Validation middleware to check for errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Auth validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  
  body('role')
    .isIn(['student', 'hotel_owner'])
    .withMessage('Role must be either student or hotel_owner'),
  
  handleValidationErrors
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Hotel validation rules
const hotelValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Hotel name must be between 2 and 100 characters'),
  
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  
  body('address.pincode')
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be 6 digits'),
  
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must be an array of [longitude, latitude]'),
  
  body('location.coordinates.*')
    .isNumeric()
    .withMessage('Coordinates must be numeric'),
  
  body('licenseNumber')
    .trim()
    .notEmpty()
    .withMessage('License number is required'),
  
  body('contactPhone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit mobile number'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('pricing.dailyMess')
    .isNumeric({ min: 0 })
    .withMessage('Daily mess price must be a positive number'),
  
  body('pricing.monthlyMess')
    .isNumeric({ min: 0 })
    .withMessage('Monthly mess price must be a positive number'),
  
  handleValidationErrors
];

// Student validation rules
const studentValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('studentId')
    .trim()
    .notEmpty()
    .withMessage('Student ID is required'),
  
  body('mobile')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit mobile number'),
  
  body('fatherName')
    .trim()
    .notEmpty()
    .withMessage('Father/Guardian name is required'),
  
  body('fatherPhone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid father/guardian mobile number'),
  
  body('emergencyContact.name')
    .trim()
    .notEmpty()
    .withMessage('Emergency contact name is required'),
  
  body('emergencyContact.phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid emergency contact mobile number'),
  
  body('emergencyContact.relation')
    .trim()
    .notEmpty()
    .withMessage('Emergency contact relation is required'),
  
  body('college.name')
    .trim()
    .notEmpty()
    .withMessage('College/University name is required'),
  
  body('faceVerification.consentGiven')
    .isBoolean()
    .custom((value) => {
      if (!value) {
        throw new Error('Face verification consent must be given');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Order validation rules
const orderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  
  body('items.*.menuItemId')
    .notEmpty()
    .withMessage('Menu item ID is required'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('orderType')
    .isIn(['daily_meal', 'ala_carte', 'monthly_plan'])
    .withMessage('Invalid order type'),
  
  handleValidationErrors
];

// Transaction validation rules
const transactionValidation = [
  body('amount')
    .isNumeric({ min: 1 })
    .withMessage('Amount must be a positive number'),
  
  body('type')
    .isIn(['topup', 'payment', 'refund'])
    .withMessage('Invalid transaction type'),
  
  handleValidationErrors
];

// Room validation rules
const roomValidation = [
  body('roomNumber')
    .trim()
    .notEmpty()
    .withMessage('Room number is required'),
  
  body('capacity')
    .isInt({ min: 1, max: 6 })
    .withMessage('Room capacity must be between 1 and 6'),
  
  body('rent.perPerson')
    .isNumeric({ min: 0 })
    .withMessage('Rent per person must be a positive number'),
  
  handleValidationErrors
];

// Menu item validation
const menuItemValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Menu item name is required'),
  
  body('price')
    .isNumeric({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('category')
    .isIn(['breakfast', 'lunch', 'dinner', 'snacks', 'beverages'])
    .withMessage('Invalid category'),
  
  body('isVeg')
    .isBoolean()
    .withMessage('isVeg must be a boolean value'),
  
  handleValidationErrors
];

module.exports = {
  registerValidation,
  loginValidation,
  hotelValidation,
  studentValidation,
  orderValidation,
  transactionValidation,
  roomValidation,
  menuItemValidation,
  handleValidationErrors
};