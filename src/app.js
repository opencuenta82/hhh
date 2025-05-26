const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/error.middleware');
const authRoutes = require('./routes/auth.routes');
const shopifyRoutes = require('./routes/shopify.routes');
const connectDB = require('./config/database');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/auth', authRoutes);
app.use('/shopify', shopifyRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'API funcionando correctamente',
    version: '1.0.0' 
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.originalUrl}`
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;