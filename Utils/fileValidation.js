import { z } from 'zod';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_TOTAL_IMAGE_SIZE = 25 * 1024 * 1024;

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const singleImageSchema = z.object({
  mimetype: z.enum(IMAGE_TYPES, {
    error: 'Only JPEG, PNG and WebP images are allowed.',
  }),
  size: z
    .number()
    .max(MAX_IMAGE_SIZE, 'Image size cannot be exceed than 5MB'),
});
export const ImageFiledSchema = singleImageSchema;

export const multipleImagesSchema = z
  .array(singleImageSchema)
  .min(1, 'At least one image is required')
  .max(5, 'Maximum 5 images allowed')
  .refine(
    (files) =>
      files.reduce((total, file) => total + file.size, 0) <=
      MAX_TOTAL_IMAGE_SIZE,
    'Total image size must be less than 25MB'
  );
