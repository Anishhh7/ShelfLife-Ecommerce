import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      maxlength: [500, 'A review can not be longer than 200 words.'],
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'A rating should be equal to 1'],
      max: [5, 'A rating should equal or less than 5'],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productVendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Review =
  mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;
