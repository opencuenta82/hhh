const path = require('path');
const express = require('express');
const router = express.Router();
const authController = require(path.join(__dirname, '../controllers/auth.controller'));
const { protect } = require(path.join(__dirname, '../middleware/auth.middleware'));
const { 
  validateRegister, 
  validateLogin,
  validateRefreshToken
} = require(path.join(__dirname, '../../middleware/validate.middleware'));

// Rutas públicas
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh-token', validateRefreshToken, authController.refreshToken);

// Rutas protegidas
router.get('/profile', protect, authController.getProfile);

module.exports = router;