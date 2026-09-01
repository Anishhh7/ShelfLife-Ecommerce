import * as productService from '../service/productService';
import catchAsync from '../utils/catchAsync';
import { sendPage, sendResponse } from '../utils/sendResponse';

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
  const page = await productService.getAllActiveProducts(req.query);

  sendPage(res, 200, page, 'Products fetched Successfully');
});

export const getAllVendorProduct = catchAsync(async (req, res) => {
  const vendorId = Number(req.user?.id);

  const products = await productService.getAllVendorProducts(
    vendorId,
    req.query
  );

  sendPage(res, 200, products);
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

export const addProductImages = catchAsync(async (req, res) => {
  const productId = Number(req.params.productId);
  const userId = Number(req.user?.id);

  const files = req.files as Express.Multer.File[];

  const images = await productService.addProductImages(
    productId,
    userId,
    files
  );

  sendResponse(
    res,
    200,
    images,
    'Product Images uploaded successfully'
  );
});

export const removeProductImages = catchAsync(async (req, res) => {
  const productId = Number(req.params.productId);
  const userId = Number(req.user?.id);
  const { imageId } = req.body;

  const image = await productService.removeProductImages(
    productId,
    userId,
    imageId
  );

  sendResponse(res, 204, null);
});
