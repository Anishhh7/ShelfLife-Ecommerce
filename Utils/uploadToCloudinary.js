import cloudinary from '../Config/cloudinary.js';

export const uploadToCloudinary = (
  file,
  folderName = 'shelflife'
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
      },
      (error, result) => {
        if (error) {
          return reject(error);
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

export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

export const changeCloudinaryImage = async (
  oldPublicId,
  newFile,
  folderName
) => {
  const newImage = await uploadToCloudinary(newFile, folderName);

  if (oldPublicId) {
    await deleteFromCloudinary(oldPublicId);
  }
  return newImage;
};
