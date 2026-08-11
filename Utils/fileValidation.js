import { z } from 'zod';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ImageFiledSchema = z.object({
  mimetype: z.enum(IMAGE_TYPES, {
    error: 'Only JPEG, PNG and WebP images are allowed.',
  }),
  size: z
    .number()
    .max(MAX_IMAGE_SIZE, 'Image size cannot be exceed than 5MB'),
});
