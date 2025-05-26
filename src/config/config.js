const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  
  // MongoDB configuration
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/shopify-api',
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_default_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_default_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  
  // Shopify API configuration
  shopify: {
    apiVersion: process.env.SHOPIFY_API_VERSION || '2024-01'
  }
};

module.exports = config;