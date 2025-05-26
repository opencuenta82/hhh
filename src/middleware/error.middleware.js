const { AppError } = require('../utils/errors');

/**
 * Maneja errores de validación de express-validator
 */
const handleValidationErrors = (errors) => {
  const messages = errors.array().map(error => `${error.path}: ${error.msg}`);
  return new AppError(`Datos de entrada inválidos: ${messages.join(', ')}`, 400);
};

/**
 * Maneja errores de duplicación de MongoDB
 */
const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  return new AppError(`Valor duplicado: ${field}. El valor "${value}" ya está en uso.`, 400);
};

/**
 * Maneja errores de validación de Mongoose
 */
const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map(err => err.message);
  return new AppError(`Datos inválidos: ${errors.join('. ')}`, 400);
};

/**
 * Maneja errores de Cast de Mongoose (ID inválido)
 */
const handleCastError = (error) => {
  return new AppError(`ID inválido: ${error.value}`, 400);
};

/**
 * Envía respuestas de error en ambiente de desarrollo
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

/**
 * Envía respuestas de error en ambiente de producción
 */
const sendErrorProd = (err, res) => {
  // Error operacional, confiable: enviar mensaje al cliente
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  } 
  // Error de programación o desconocido: no filtrar detalles al cliente
  else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      message: 'Algo salió mal. Por favor, inténtalo de nuevo más tarde.'
    });
  }
};

/**
 * Middleware global para manejo de errores
 */
exports.errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastError(err);
    if (err.code === 11000) error = handleDuplicateKeyError(err);
    if (err.name === 'ValidationError') error = handleValidationError(err);
    if (err.name === 'express-validator') error = handleValidationErrors(err);

    sendErrorProd(error, res);
  }
};