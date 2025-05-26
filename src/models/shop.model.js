const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    shop_domain: {
      type: String,
      required: [true, 'El dominio de la tienda es obligatorio'],
      unique: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/,
        'Formato de dominio de Shopify inválido'
      ]
    },
    shop_name: {
      type: String,
      trim: true
    },
    access_token: {
      type: String,
      required: [true, 'El token de acceso es obligatorio'],
      select: false
    },
    api_version: {
      type: String,
      required: [true, 'La versión de la API es obligatoria'],
      match: [
        /^\d{4}-\d{2}$/,
        'Formato de versión de API inválido'
      ]
    },
    status: {
      type: String,
      enum: ['connected', 'disconnected', 'error'],
      default: 'connected'
    },
    connected_at: {
      type: Date,
      default: Date.now
    },
    last_sync: {
      type: Date,
      default: null
    },
    webhooks: [{
      webhook_id: String,
      topic: String,
      address: String,
      format: {
        type: String,
        enum: ['json', 'xml'],
        default: 'json'
      },
      created_at: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

// Índices para optimizar consultas
shopSchema.index({ user_id: 1 });
shopSchema.index({ shop_domain: 1 }, { unique: true });

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;