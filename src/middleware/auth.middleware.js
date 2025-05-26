const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/user.model');
const { AppError } = require('../utils/errors');

/**
 * Middleware para proteger rutas que requieren autenticación
 */
exports.protect = async (req, res, next) => {
  try {
    // 1) Verificar que el token existe
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('No has iniciado sesión. Por favor, inicia sesión para obtener acceso.', 401));
    }

    // 2) Verificar que el token es válido
    const decoded = jwt.verify(token, config.jwt.secret);

    // 3) Verificar que el usuario existe
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('El usuario al que pertenece este token ya no existe.', 401));
    }

    // 4) Guardar el usuario en el objeto de solicitud
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token inválido. Por favor, inicia sesión de nuevo.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', 401));
    }
    next(error);
  }
};

/**
 * Middleware para restringir el acceso a roles específicos
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('No tienes permiso para realizar esta acción.', 403));
    }
    next();
  };
};