const Shop = require('../models/shop.model');
const { AppError, catchAsync } = require('../utils/errors');
const { shopifyApiRequest } = require('../services/shopify.service');

/**
 * @desc    Conectar tienda Shopify
 * @route   POST /shopify/connect
 * @access  Privado
 */
exports.connectShop = catchAsync(async (req, res, next) => {
  const { shop_domain, access_token, api_version } = req.body;
  const userId = req.user._id;

  // Verificar si la tienda ya está conectada por este usuario
  let shop = await Shop.findOne({ shop_domain });
  
  if (shop) {
    // Si la tienda existe pero pertenece a otro usuario
    if (shop.user_id.toString() !== userId.toString()) {
      return next(new AppError('Esta tienda ya está conectada a otra cuenta', 400));
    }
    
    // Actualizar datos de la tienda
    shop.access_token = access_token;
    shop.api_version = api_version;
    shop.status = 'connected';
    shop.connected_at = Date.now();
  } else {
    // Crear nueva conexión de tienda
    shop = new Shop({
      user_id: userId,
      shop_domain,
      access_token,
      api_version
    });
  }

  // Verificar conexión con Shopify obteniendo los datos de la tienda
  try {
    const shopData = await shopifyApiRequest({
      shop_domain,
      access_token,
      api_version,
      endpoint: 'shop',
      method: 'GET'
    });

    shop.shop_name = shopData.name;
    await shop.save();

    res.status(200).json({
      success: true,
      message: 'Tienda conectada exitosamente',
      data: {
        shop_id: shop._id,
        shop_name: shop.shop_name,
        domain: shop.shop_domain,
        status: shop.status,
        connected_at: shop.connected_at
      }
    });
  } catch (error) {
    return next(new AppError(`Error al conectar con Shopify: ${error.message}`, 400));
  }
});

/**
 * @desc    Obtener productos de Shopify
 * @route   GET /shopify/products
 * @access  Privado
 */
exports.getProducts = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  
  // Obtener parámetros de consulta
  const { page = 1, limit = 50, status } = req.query;
  
  // Verificar que el usuario tiene una tienda conectada
  const shop = await Shop.findOne({ user_id: userId }).select('+access_token');
  
  if (!shop) {
    return next(new AppError('No tienes ninguna tienda conectada', 404));
  }

  // Construir los parámetros de la consulta a la API de Shopify
  const params = new URLSearchParams();
  params.append('limit', Math.min(limit, 250)); // Máximo 250 productos por request en Shopify
  params.append('page', page);
  
  if (status) {
    params.append('status', status);
  }

  try {
    const productsData = await shopifyApiRequest({
      shop_domain: shop.shop_domain,
      access_token: shop.access_token,
      api_version: shop.api_version,
      endpoint: 'products',
      method: 'GET',
      params: params.toString()
    });

    // Actualizar la última sincronización
    shop.last_sync = Date.now();
    await shop.save();

    // Extraer datos relevantes y estructurar respuesta
    const products = productsData.products.map(product => ({
      id: product.id,
      title: product.title,
      handle: product.handle,
      product_type: product.product_type,
      status: product.status,
      images: product.images.map(image => ({
        id: image.id,
        src: image.src,
        alt: image.alt
      })),
      variants: product.variants.map(variant => ({
        id: variant.id,
        title: variant.title,
        price: variant.price,
        inventory_quantity: variant.inventory_quantity
      })),
      created_at: product.created_at,
      updated_at: product.updated_at
    }));

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(productsData.count / limit),
          total_products: productsData.count
        }
      }
    });
  } catch (error) {
    return next(new AppError(`Error al obtener productos de Shopify: ${error.message}`, 400));
  }
});

/**
 * @desc    Obtener detalles de un producto específico
 * @route   GET /shopify/products/:id
 * @access  Privado
 */
exports.getProductById = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const productId = req.params.id;
  
  // Verificar que el usuario tiene una tienda conectada
  const shop = await Shop.findOne({ user_id: userId }).select('+access_token');
  
  if (!shop) {
    return next(new AppError('No tienes ninguna tienda conectada', 404));
  }

  try {
    const productData = await shopifyApiRequest({
      shop_domain: shop.shop_domain,
      access_token: shop.access_token,
      api_version: shop.api_version,
      endpoint: `products/${productId}`,
      method: 'GET'
    });

    res.status(200).json({
      success: true,
      data: productData.product
    });
  } catch (error) {
    return next(new AppError(`Error al obtener el producto: ${error.message}`, 400));
  }
});

/**
 * @desc    Obtener detalles de una variante específica
 * @route   GET /shopify/variants/:id
 * @access  Privado
 */
exports.getVariantById = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const variantId = req.params.id;
  
  // Verificar que el usuario tiene una tienda conectada
  const shop = await Shop.findOne({ user_id: userId }).select('+access_token');
  
  if (!shop) {
    return next(new AppError('No tienes ninguna tienda conectada', 404));
  }

  try {
    const variantData = await shopifyApiRequest({
      shop_domain: shop.shop_domain,
      access_token: shop.access_token,
      api_version: shop.api_version,
      endpoint: `variants/${variantId}`,
      method: 'GET'
    });

    res.status(200).json({
      success: true,
      data: variantData.variant
    });
  } catch (error) {
    return next(new AppError(`Error al obtener la variante: ${error.message}`, 400));
  }
});

/**
 * @desc    Obtener webhooks activos
 * @route   GET /shopify/webhooks
 * @access  Privado
 */
exports.getWebhooks = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  
  // Verificar que el usuario tiene una tienda conectada
  const shop = await Shop.findOne({ user_id: userId }).select('+access_token');
  
  if (!shop) {
    return next(new AppError('No tienes ninguna tienda conectada', 404));
  }

  try {
    const webhooksData = await shopifyApiRequest({
      shop_domain: shop.shop_domain,
      access_token: shop.access_token,
      api_version: shop.api_version,
      endpoint: 'webhooks',
      method: 'GET'
    });

    res.status(200).json({
      success: true,
      data: {
        webhooks: webhooksData.webhooks
      }
    });
  } catch (error) {
    return next(new AppError(`Error al obtener webhooks: ${error.message}`, 400));
  }
});

/**
 * @desc    Registrar nuevo webhook
 * @route   POST /shopify/webhooks
 * @access  Privado
 */
exports.registerWebhook = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { topic, address, format } = req.body;
  
  // Verificar que el usuario tiene una tienda conectada
  const shop = await Shop.findOne({ user_id: userId }).select('+access_token');
  
  if (!shop) {
    return next(new AppError('No tienes ninguna tienda conectada', 404));
  }

  try {
    // Crear el webhook en Shopify
    const webhookData = await shopifyApiRequest({
      shop_domain: shop.shop_domain,
      access_token: shop.access_token,
      api_version: shop.api_version,
      endpoint: 'webhooks',
      method: 'POST',
      data: {
        webhook: {
          topic,
          address,
          format
        }
      }
    });

    // Guardar referencia al webhook en nuestra base de datos
    shop.webhooks.push({
      webhook_id: webhookData.webhook.id,
      topic: webhookData.webhook.topic,
      address: webhookData.webhook.address,
      format: webhookData.webhook.format
    });
    
    await shop.save();

    res.status(201).json({
      success: true,
      data: webhookData.webhook
    });
  } catch (error) {
    return next(new AppError(`Error al registrar webhook: ${error.message}`, 400));
  }
});