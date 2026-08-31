import cloudinary from '../config/cloudinary';
import { logger } from '../lib/logger';

interface cloudinaryUploadResult {
  url: string;
  publicId: string;
}

export const uploadToCloudinary = (
  file: Express.Multer.File,
  folderName = 'Shelflife'
): Promise<cloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(new Error('Cloudinary upload failed'));
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(file.buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error('Error deleting from cloudinary:');
    throw error;
  }
};

export const changeCloudinaryImage = async (
  oldPublicId: string | null,
  newFile: Express.Multer.File,
  folderName: 'shelflife'
): Promise<cloudinaryUploadResult> => {
  const newImage = await uploadToCloudinary(newFile, folderName);
  if (oldPublicId) {
    await deleteFromCloudinary(oldPublicId);
  }

  return newImage;
};
