const Shop = require('../../models/shop.model');
const { AppError } = require('../../utils/errors');
const { catchAsync } = require('../../utils/errors');

exports.getAllShops = catchAsync(async (req, res) => {
  const shops = await Shop.find();
  res.status(200).json({
    status: 'success',
    data: {
      shops
    }
  });
});

exports.getShopById = catchAsync(async (req, res, next) => {
  const shop = await Shop.findById(req.params.id);
  
  if (!shop) {
    return next(new AppError('No se encontró la tienda', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      shop
    }
  });
});

exports.createShop = catchAsync(async (req, res) => {
  const shop = await Shop.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      shop
    }
  });
});

exports.updateShop = catchAsync(async (req, res, next) => {
  const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!shop) {
    return next(new AppError('No se encontró la tienda', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      shop
    }
  });
});

exports.deleteShop = catchAsync(async (req, res, next) => {
  const shop = await Shop.findByIdAndDelete(req.params.id);

  if (!shop) {
    return next(new AppError('No se encontró la tienda', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
