const express = require('express');
const router = express.Router();
const shopifyController = require('../controllers/shopify.controller');
const { protect } = require('../middleware/auth.middleware');
const { 
  validateShopifyConnect,
  validateWebhookRegister
} = require('../middleware/validate.middleware');

// Todas las rutas requieren autenticación
router.use(protect);

// Rutas de Shopify
router.post('/connect', validateShopifyConnect, shopifyController.connectShop);
router.get('/products', shopifyController.getProducts);
router.get('/products/:id', shopifyController.getProductById);
router.get('/variants/:id', shopifyController.getVariantById);
router.get('/webhooks', shopifyController.getWebhooks);
router.post('/webhooks', validateWebhookRegister, shopifyController.registerWebhook);

module.exports = router;