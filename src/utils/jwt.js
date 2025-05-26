const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Genera un token JWT
 * @param {Object} payload - Datos a incluir en el token
 * @param {string} secret - Secreto para firmar el token
 * @param {string} expiresIn - Tiempo de expiración
 * @returns {string} Token JWT
 */
const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Genera un token de acceso
 * @param {string} userId - ID del usuario
 * @returns {string} Token de acceso
 */
exports.generateAccessToken = (userId) => {
  return generateToken({ id: userId }, config.jwt.secret, config.jwt.expiresIn);
};

/**
 * Genera un token de actualización
 * @param {string} userId - ID del usuario
 * @returns {string} Token de actualización
 */
exports.generateRefreshToken = (userId) => {
  return generateToken({ id: userId }, config.jwt.refreshSecret, config.jwt.refreshExpiresIn);
};

/**
 * Verifica un token JWT
 * @param {string} token - Token a verificar
 * @param {string} secret - Secreto para verificar el token
 * @returns {Object} Datos decodificados del token
 */
exports.verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};