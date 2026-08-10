import mongoose from 'mongoose';
import Default_Images from '../Config/defaultImages.js';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
    },
    coverImage: {
      type: {
        url: String,
        publicId: String,
      },
      default: Default_Images.category,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Category =
  mongoose.models.Category ||
  mongoose.model('Category', categorySchema);

export default Category;
