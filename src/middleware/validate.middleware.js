const { validationResult, body } = require('express-validator');
const { AppError } = require('../utils/errors');

/**
 * Middleware para validar resultados de express-validator
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new AppError('Error de validación', 400);
    error.name = 'express-validator';
    error.errors = errors;
    return next(error);
  }
  next();
};

/**
 * Validación para registro de usuario
 */
exports.validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Debes proporcionar un email válido'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  body('confirm_password')
    .trim()
    .notEmpty().withMessage('La confirmación de contraseña es obligatoria')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
  
  exports.validate
];

/**
 * Validación para inicio de sesión
 */
exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Debes proporcionar un email válido'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('La contraseña es obligatoria'),
  
  exports.validate
];

/**
 * Validación para refresh token
 */
exports.validateRefreshToken = [
  body('refresh_token')
    .trim()
    .notEmpty().withMessage('El refresh token es obligatorio'),
  
  exports.validate
];

/**
 * Validación para conexión con Shopify
 */
exports.validateShopifyConnect = [
  body('shop_domain')
    .trim()
    .notEmpty().withMessage('El dominio de la tienda es obligatorio')
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/).withMessage('Formato de dominio de Shopify inválido'),
  
  body('access_token')
    .trim()
    .notEmpty().withMessage('El token de acceso es obligatorio'),
  
  body('api_version')
    .trim()
    .notEmpty().withMessage('La versión de la API es obligatoria')
    .matches(/^\d{4}-\d{2}$/).withMessage('Formato de versión de API inválido'),
  
  exports.validate
];

/**
 * Validación para registrar webhooks
 */
exports.validateWebhookRegister = [
  body('topic')
    .trim()
    .notEmpty().withMessage('El tema del webhook es obligatorio')
    .isIn([
      'products/create', 
      'products/update', 
      'products/delete',
      'orders/create',
      'orders/updated',
      'orders/cancelled'
    ]).withMessage('Tema de webhook no válido'),
  
  body('address')
    .trim()
    .notEmpty().withMessage('La dirección del webhook es obligatoria')
    .isURL().withMessage('Debe ser una URL válida'),
  
  body('format')
    .trim()
    .notEmpty().withMessage('El formato es obligatorio')
    .isIn(['json', 'xml']).withMessage('Formato no válido'),
  
  exports.validate
];