const { body } = require('express-validator');

const validateRegister = [
  body('email').isEmail().withMessage('Debe ser un email válido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('name').notEmpty().withMessage('El nombre es requerido')
];

const validateLogin = [
  body('email').isEmail().withMessage('Debe ser un email válido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
];

const validateRefreshToken = [
  body('refreshToken').notEmpty().withMessage('El token de refresco es requerido')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateRefreshToken
};
