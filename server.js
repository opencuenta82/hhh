require('dotenv').config();
const app = require('./src/app');
const config = require('./src/config/config');

// Start the server
app.listen(config.port, () => {
  console.log(`Servidor ejecutándose en el puerto ${config.port} en modo ${config.nodeEnv}`);
});