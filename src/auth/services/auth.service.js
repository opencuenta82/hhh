const User = require('../models/user.model');
const { AppError } = require('../utils/errors');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

/**
 * Servicio para crear un nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} Usuario creado y tokens
 */
exports.createUser = async (userData) => {
  const { name, email, password } = userData;

  // Verificar si el usuario ya existe
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('El usuario ya existe con ese email', 400);
  }

  // Crear nuevo usuario
  const user = await User.create({
    name,
    email,
    password
  });

  // Generar tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Actualizar fecha de último login
  await user.updateLastLogin();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    tokens: {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600
    }
  };
};

/**
 * Servicio para autenticar un usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} Usuario autenticado y tokens
 */
exports.authenticateUser = async (email, password) => {
  // Buscar usuario y obtener contraseña para comparar
  const user = await User.findOne({ email }).select('+password');
  
  // Verificar si el usuario existe y la contraseña es correcta
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Email o contraseña incorrectos', 401);
  }

  // Generar tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Actualizar fecha de último login
  await user.updateLastLogin();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    tokens: {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600
    }
  };
};