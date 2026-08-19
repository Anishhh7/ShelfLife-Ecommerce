import catchAsync from '../utils/catchAsync';
import sendResponse from '../utils/sendResponse';
import * as productService from '../service/productService';

export const createProduct = catchAsync(async (req, res, next) => {
  const vendorId = Number(req.user?.id);

  const product = await productService.createProduct(
    vendorId,
    req.body
  );

  sendResponse(res, 200, product, 'Product created successfully');
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const vendorId = Number(req.user?.id);
  const { productId } = req.params;

  const product = await productService.updateProduct(
    vendorId,
    Number(productId),
    req.body
  );
  sendResponse(res, 200, product, 'Product updated successfully');
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  const vendorId = Number(req.user?.id);
  const { productId } = req.params;

  await productService.deleteProduct(vendorId, Number(productId));

  sendResponse(res, 204, null, 'Product deleted successfully');
});

export const getAllActiveProducts = catchAsync(async (req, res) => {
  const products = await productService.getAllActiveProduct(
    req.query
  );

  sendResponse(res, 200, products, { results: products.length });
});

export const getAllVendorProduct = catchAsync(async (req, res) => {
  const vendorId = Number(req.user?.id);

  const products = await productService.getAllVendorProducts(
    vendorId,
    req.query
  );

  sendResponse(res, 200, products, {
    results: products.length,
  });
});

export const getActiveProductById = catchAsync(
  async (req, res, next) => {
    const { productId } = req.params;

    const product = await productService.getActiveProductById(
      Number(productId)
    );

    sendResponse(res, 200, product);
  }
);

export const getVendorProductById = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const vendorId = Number(req.user?.id);

  const product = await productService.getVendorProductById(
    vendorId,
    Number(productId)
  );

  sendResponse(res, 200, product);
});
