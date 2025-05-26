const User = require('../models/user.model');
const { AppError, catchAsync } = require('../utils/errors');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const config = require('../config/config');

/**
 * @desc    Registrar un nuevo usuario
 * @route   POST /auth/register
 * @access  Público
 */
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Verificar si el usuario ya existe
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError('El usuario ya existe con ese email', 400));
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

  res.status(201).json({
    success: true,
    data: {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }
  });
});

/**
 * @desc    Iniciar sesión de usuario
 * @route   POST /auth/login
 * @access  Público
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Buscar usuario y obtener contraseña para comparar
  const user = await User.findOne({ email }).select('+password');
  
  // Verificar si el usuario existe y la contraseña es correcta
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Email o contraseña incorrectos', 401));
  }

  // Generar tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Actualizar fecha de último login
  await user.updateLastLogin();

  res.status(200).json({
    success: true,
    data: {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }
  });
});

/**
 * @desc    Renovar token de acceso
 * @route   POST /auth/refresh-token
 * @access  Público
 */
exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return next(new AppError('No se proporcionó un token de actualización', 400));
  }

  try {
    // Verificar el token de actualización
    const decoded = verifyToken(refresh_token, config.jwt.refreshSecret);
    
    // Buscar usuario
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('Usuario no encontrado', 404));
    }

    // Generar nuevo token de acceso
    const accessToken = generateAccessToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        access_token: accessToken,
        expires_in: 3600
      }
    });
  } catch (error) {
    return next(new AppError('Token de actualización inválido o expirado', 401));
  }
});

/**
 * @desc    Obtener perfil de usuario
 * @route   GET /auth/profile
 * @access  Privado
 */
exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError('Usuario no encontrado', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      last_login: user.last_login
    }
  });
});