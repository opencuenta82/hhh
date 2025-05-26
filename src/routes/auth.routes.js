const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { 
  validateRegister, 
  validateLogin,
  validateRefreshToken
} = require('../middleware/validate.middleware');

// Rutas públicas
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh-token', validateRefreshToken, authController.refreshToken);

// Rutas protegidas
router.get('/profile', protect, authController.getProfile);

module.exports = router;