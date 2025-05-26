const https = require('https');

/**
 * Realiza una solicitud a la API de Shopify
 * @param {Object} options - Opciones para la solicitud
 * @param {string} options.shop_domain - Dominio de la tienda Shopify
 * @param {string} options.access_token - Token de acceso de la tienda
 * @param {string} options.api_version - Versión de la API
 * @param {string} options.endpoint - Endpoint de la API
 * @param {string} options.method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {string} options.params - Parámetros de consulta
 * @param {Object} options.data - Datos para POST/PUT
 * @returns {Promise<Object>} Respuesta de la API
 */
exports.shopifyApiRequest = ({ 
  shop_domain, 
  access_token, 
  api_version, 
  endpoint, 
  method = 'GET',
  params = '',
  data = null
}) => {
  return new Promise((resolve, reject) => {
    // Validar parámetros obligatorios
    if (!shop_domain || !access_token || !api_version || !endpoint) {
      return reject(new Error('Faltan parámetros obligatorios para la solicitud a Shopify'));
    }

    // Construir URL de la API
    const path = `/admin/api/${api_version}/${endpoint}.json${params ? `?${params}` : ''}`;
    
    // Opciones para la solicitud HTTPS
    const options = {
      hostname: shop_domain,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': access_token
      }
    };

    // Crear la solicitud
    const req = https.request(options, (res) => {
      let responseData = '';

      // Recopilar datos de respuesta
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      // Procesar respuesta completa
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          
          // Verificar errores de la API
          if (res.statusCode >= 400) {
            return reject(new Error(`Error ${res.statusCode}: ${JSON.stringify(parsedData.errors || parsedData)}`));
          }
          
          resolve(parsedData);
        } catch (error) {
          reject(new Error(`Error al procesar la respuesta: ${error.message}`));
        }
      });
    });

    // Manejar errores de la solicitud
    req.on('error', (error) => {
      reject(new Error(`Error de conexión: ${error.message}`));
    });

    // Enviar datos si es POST o PUT
    if (data && (method === 'POST' || method === 'PUT')) {
      req.write(JSON.stringify(data));
    }

    // Finalizar la solicitud
    req.end();
  });
};