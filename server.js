require('dotenv').config();
const app = require('./src/app');
const config = require('./src/config/config');

// Start the server
const port = process.env.PORT || 3001; // Usar el puerto desde env o 3001 por defecto
app.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto ${port} en modo ${config.nodeEnv}`);
});